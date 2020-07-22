/* ########## Exemplo de api para upload dos arquivos: ##########

// Crie um arquivo api.js com o código abaixo.
// Altere o caminho para o modulo apiReceiveUpload se necessário.

import { apiReceiveUpload } from '../../libs/apiReceiveUpload'

export const config = {
    api:{
        bodyParser:false,
    }
}

export default async (req, res) => {
    await new Promise((resolve, reject) => {
        apiReceiveUpload(req,res,resolve,reject)
    })
}

########## Exemplo de api para upload dos arquivos: ########## */

/* ########## Definições das propriedades (props): ##########

_id: ID do arquivo para alteração
api: api de upload do arquivo (importante revalidar os arquivos).
callbackUploaded: função a ser executada após o upload.
cols: define quantas colunas serão ocupadas no modo responsivo.
maxRatio: máxima relação de altura e largura de imagem.
maxWidth: largura de imagem máxima.
mime_types: tipos permitidos. Ex: [ 'image/jpeg', 'image/png', 'application/pdf', 'application/doc', 'application/docx', 'application/xls', 'application/xlsx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ]
minHeight: altura mínima do quadro drag drop.
minRatio: mínima relação de altura e largura de imagem.
minWidth: largura de imagem mínima.
msgErroMaxWidth: mensagem de erro de largura máxima.
msgErroMinWidth: mensagem de erro de largura mínima.
msgErroRatio: mensagem de erro de ratio.
multiple: quando true permite multiplos arquivos.
name: nome do componente.
orientation: verifica a orientação da imagem. Ex: 'portrait' ou 'landscape'
resetEvery: quando true reseta a lista a cada arquivo.
sizeLimit: tamanho máximo permitido. Ex: 5*1024*1024 // 5MB
storage: Local onde o arquivo será armazenado. Opções: HD,DB,S3
text: Texto que aparece quadro drag drop.

########## Definições das propriedades (props): ########## */

import React from 'react';
import { setCols } from '../libs/functions'

var uploadFileOpen = 0
var uploadFileClose = 0

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dragenter:false
		};
	}

	componentDidMount(){
		if(this.props.name && this.props.pageName && this.props.api && this.props.storage){
			if((this.props.storage=="HD" && this.props.path) || this.props.storage=="DB" || (this.props.storage=="S3" && this.props.bucket)){
				uploadFileOpen = 0
				uploadFileClose = 0

				let drop_ = document.getElementById('upload-file' + this.props.name);
				
				drop_.addEventListener('dragenter',() => this.setState({dragenter:true}));
				drop_.addEventListener('dragleave',() => this.setState({dragenter:false}));
				drop_.addEventListener('drop',() => this.setState({dragenter:false}));
				
				document.getElementById('upload-file' + this.props.name).addEventListener('change',() => this.getFile());
			}
		}
	}

	getFile(){
		var files = document.getElementById('upload-file' + this.props.name).files;
		for(var i = 0; i < files.length; i++){
			this.validarArquivo(files[i],i);
		}
	}

	validarArquivo(file,indice){
		if(this.props.mime_types ? this.props.mime_types.indexOf(file.type)==-1 ? true : false : false){
			this.aposValidar({"error" : "O arquivo " + file.name + " não é permitido!"},indice);
		}else if(this.props.sizeLimit ? file.size > this.props.sizeLimit ? true : false : false){
			var limit = ((this.props.sizeLimit / 1024) / 1024);
			this.aposValidar({"error" : "O arquivo " + file.name + " ultrapassou limite de " + limit + "MB"},indice);
		}else if(file.type.match(/image.*/)){
			var img = document.createElement('img');

			img.onload = () => {
				var orientation = this.props.orientation;
				var minRatio = this.props.minRatio;
				var maxRatio = this.props.maxRatio;
				var msgErroRatio = this.props.msgErroRatio;
				var minWidth = this.props.minWidth;
				var msgErroMinWidth = this.props.msgErroMinWidth;
				var maxWidth = this.props.maxWidth;
				var msgErroMaxWidth = this.props.msgErroMaxWidth;
				var width = img.width;
				var height = img.height;
				
				var result = true;
				var erro;
				
				var ratio = (width / height);
				
				if(orientation ? orientation=="landscape" ? true : false : false){
					if(ratio<1){
						erro = {"error" : "Escolha uma imagem em formato de paisagem!"};
						result = false;
					}
				}else if(orientation ? orientation=="portrait" ? true : false : false){
					if(ratio>=1){
						erro = {"error" : "Escolha uma imagem em formato de retrato!"};
						result = false;
					}
				}
				
				if(minRatio ? maxRatio ? true : false : false){
					if(msgErroRatio){
						if(ratio<minRatio || ratio>maxRatio){
							erro = {"error" : msgErroRatio};
							result = false;
						}
					}
				}
				
				if(minWidth && msgErroMinWidth){
					if(width<minWidth){
						erro = {"error" : msgErroMinWidth};
						result = false;
					}
				}
				
				if(maxWidth && msgErroMaxWidth){
					if(width>maxWidth){
						erro = {"error" : msgErroMaxWidth};
						result = false;
					}
				}
				
				if(result===true){
					this.aposValidar({"success": "Enviando: " + file.name},indice);
				}else{
					this.aposValidar(erro,indice);
				}	
			}
				
			var reader = new FileReader();
			reader.onload = function(e) {img.src = e.target.result};
			reader.readAsDataURL(file);
		}else{
			this.aposValidar({"success": "Enviando: " + file.name},indice);
		}
	}

	aposValidar(info,indice){
		var barra = document.createElement("div");
		var fill = document.createElement("div");
		var text = document.createElement("div");
		barra.appendChild(fill);
		barra.appendChild(text);
		
		barra.classList.add("barra");
		fill.classList.add("fillB");
		text.classList.add("textB");
		
		if(typeof info.error === 'undefined'){
			text.innerHTML = info.success;
			this.enviarArquivo(indice,barra);
		}else{
			text.innerHTML = info.error;
			barra.classList.add("error");
		}
		
		if(this.props.resetEvery){
			document.getElementById('lista-uploads' + this.props.name).innerHTML = "";
		}
		document.getElementById('lista-uploads' + this.props.name).appendChild(barra);
	}

	enviarArquivo(indice,barra){
		var data = new FormData();
		var request = new XMLHttpRequest();
		var callbackUploaded = this.props.callbackUploaded;
		var countA = [];
		var countB = [];
		var gate = [];
		var files = document.getElementById('upload-file' + this.props.name).files;

		uploadFileOpen = (uploadFileOpen + 1)

		data.append('file', files[indice]);
		data.append('params',JSON.stringify({
			_id: this.props._id,
			action:'registerUpdate',
			storage:this.props.storage,
			path:this.props.path,
			pageName:this.props.pageName,
			ref:this.props._idRef,
			bucket:this.props.bucket
		}));
		data.append('token',process.env.tokenApi);
			
		request.addEventListener('load', function(e) {
			if(request.response.res == "success"){
				countB[indice] = countA[indice];
				barra.querySelector(".fillB").style.minWidth = "100%";
				barra.querySelector(".textB").innerHTML = request.response.name + ' carregado!';
				barra.classList.add("completeB");

				uploadFileClose = (uploadFileClose + 1)

				if(callbackUploaded && uploadFileOpen==uploadFileClose){
					callbackUploaded(request.response.data._id);
				}
			}else{
				barra.querySelector(".textB").innerHTML = "Erro ao tentar enviar o arquivo" + (typeof request.response.name === 'undefined' ? '!' : ' ' + typeof request.response.name);
				barra.classList.add("error");
			}
		});

		gate[indice] = true;
		countA[indice] = 0;
		countB[indice] = 0;
		setInterval(() => {
			if(gate[indice]===true){
				countA[indice] = countA[indice] + 1;
			}else if(countB[indice]<countA[indice]){
				countB[indice] = countB[indice] + 1;
				var percent_complete = (((countB[indice] / countA[indice])*50) + 50);
				barra.querySelector(".fillB").style.minWidth = percent_complete + "%";
			}
		},100)
			
		request.upload.addEventListener('progress', function(e) {
			var percent_complete = (e.loaded / e.total)*50;

			if(percent_complete<50){
				gate[indice] = true;
			}else{
				gate[indice] = false;
			}
			
			barra.querySelector(".fillB").style.minWidth = percent_complete + "%";
		});
			
		request.responseType = 'json';
			
		request.open('post', process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api); 
		request.send(data);
	}

	resetList(){
		document.getElementById('lista-uploads' + this.props.name).innerHTML = "";
	}

  	render(){
		return (
			<>
				<div className={this.props.cols + " baseAreaUpload"}>
					<div className={"area-upload"}>
						{!this.props.name ? (
							<div className="texto">Informe o nome</div>
						):!this.props.pageName ? (
							<div className="texto">Informe a pageName</div>
						):!this.props.api ? (
							<div className="texto">Informe a api de upload</div>
						):!this.props.storage ? (
							<div className="texto">Informe o storage, local de armazenamento do arquivo (HD, DB ou S3)</div>
						):(this.props.storage!="HD" && this.props.storage!="DB" && this.props.storage!="S3") ? (
							<div className="texto">As opções de storage são HD, DB ou S3</div>
						):(this.props.storage=="HD" && !this.props.path) ? (
							<div className="texto">Informe o path do local de armazenamento do arquivo</div>
						):(this.props.storage=="S3" && !this.props.bucket) ? (
							<div className="texto">Informe o bucket do local de armazenamento do arquivo no S3 da AWS</div>
						):(
							<form method="post" encType="multipart/form-data">  
								<label className={this.state.dragenter===true ? "label-upload highlight" : "label-upload"} id={"label-upload" + this.props.name}>
									<div className="texto">{this.props.text ? this.props.text : (<>Clique ou Arraste<br/>um Arquivo Aqui</>)}</div>
								</label>
								<input type="file" accept={this.props.mime_types ? this.props.mime_types.join() : null} id={"upload-file" + this.props.name} multiple={this.props.multiple ? this.props.multiple : true} />
								<div className="lista-uploads" id={"lista-uploads" + this.props.name}>
								</div>
							</form>
						)}
					</div>
				</div>
				<style jsx>{`
					.baseAreaUpload{
						width: 100%;
						min-height:${(this.props.minHeight ? this.props.minHeight : '200px')};
						align-items: center;
						justify-content: center;
						display:block;
						z-index:500;
						position: relative;
					}
					.area-upload{
						margin: 0px;
						padding: 20px;
						box-sizing: border-box;	
						width: 100%;
						display: block;
						min-height:${(this.props.minHeight ? this.props.minHeight : '200px')};
						background-color: white;
						position: relative;
					}

					.area-upload label.label-upload{
						border-radius: 5px;
						border: 2px dashed #cdeafa;
						min-height: 100%;
						text-align: center;
						width: 100%;
						height: 100%;
						min-height:${(this.props.minHeight ? this.props.minHeight : '200px')};
						
						display: flex;
						justify-content: center;
						flex-direction: column;
						color: #0d8acd;
						position: relative;
						
						-webkit-transition: .3s all;
						-moz-transition: .3s all;
						-o-transition: .3s all;
						transition: .3s all;
					}
				`}</style>
			</>
		)
  	}
}
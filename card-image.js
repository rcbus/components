/* ########## Exemplo de api para upload dos arquivos: ##########

// Crie um arquivo upload.js com o código abaixo.
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

/* ########## Exemplo de api para listar as imagens: ###########

ATENÇÃO: Use o mesmo nome do arquivo da api de upload acrescentando '_list' ao nome
Exemplo nome da api: upload.js
Exemplo nome da api lista: upload_list.js

Exemplo de api para listar as imagens:

import { sel } from '../../libs/mongo'
import { security } from '../../libs/api'

export default async (req, res) => {
    return new Promise(resolve => {
        const securityResult = security(req);
        if(securityResult.res=='error'){
            res.statusCode = 200
            res.json(securityResult)
            resolve()
        }else if(securityResult.res=='success'){
            var data = securityResult.data
            
            sel('file',data,{},(result) => {
                if(result.error){
                    res.statusCode = 200
                    res.json({res:'error',error:result.error})
                    resolve()
                }else{
                    res.statusCode = 200
                    res.json({ res: 'success',data: result.data })
                    resolve()
                }
            },{date:1})
        }else{
            res.statusCode = 200
            res.json({ res: 'error',error: 'undefined' })
            resolve()
        }    
    })
}

########## Exemplo de api para listar as imagens: ########### */

/* ########## Definições das propriedades (props): ##########

idRef: ID referencia ao item a que se refere a imagem, por exemplo o ID do produto.
api: api de upload do arquivo (importante revalidar os arquivos).
callbackUploaded: função a ser executada após o upload.
cols: colunas que a imagem vai ocupar no modo responsivo.
limit: define o limite de fotos.
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
requireIdRefToEdit: quando true exige um idRef para permitir a edição. 
resetEvery: quando true reseta a lista a cada arquivo.
sizeLimit: tamanho máximo permitido. Ex: 5*1024*1024 // 5MB
storage: Local onde o arquivo será armazenado. Opções: HD,DB,S3
text: Texto que aparece quadro drag drop.

########## Definições das propriedades (props): ########## */

import React from 'react';
import { setCols,strlen,count } from '../libs/functions'
import DropZone from './drop-zone'
import { api } from '../libs/api'
import { openMsg } from './msg'

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDragDrop: false,
			list: [],
			path: '../noPhoto.png',
			data: '',
			type: '',
			prev: false,
			next: false,
			count: 0,
			current: 0,
			showCount: false,
			_id:'',
			_idA:'',
			storage:'',
			update:false,
			confirmDelete: 0,
			idRef:false
		};
	}

	componentDidMount(){
		if(this.state.idRef===false){
			this.setState({idRef:this.props.idRef})
			this.uploaded(false)
		}
	}

	componentDidUpdate(){
		if(this.state.idRef!=this.props.idRef){
			this.setState({idRef:this.props.idRef})
			this.uploaded(false)
		}
	}

	back(){
		this.setState({
			showDragDrop:false,
			update:false,
			confirmDelete: 0,
			_id:this.state._idA
		})
	}

	delete(){
		if(this.state.confirmDelete==0){
			this.setState({confirmDelete:1})
		}else if(strlen(this.state._id)>0){
			this.setState({confirmDelete:2})
			var data = new FormData();
			var request = new XMLHttpRequest();
			
			data.append('params',JSON.stringify({
				_id: this.state._id,
				action:'delete',
				storage:this.state.storage,
				path:this.props.path,
				bucket:this.props.bucket
			}));
			data.append('token',process.env.tokenApi);
				
			request.addEventListener('load', (e) => {
				if(request.response.res == "success"){
					if(this.state.prev!==false){
						this.uploaded(this.state.prev)
					}else if(this.state.next!==false){
						this.uploaded(this.state.next)
					}else{
						this.uploaded(false)
					}
				}else{
					// erro
				}
			});
	
			request.responseType = 'json';
				
			request.open('post', process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api); 
			request.send(data);
		}
	}

	loadImage(){
		if(this.state.storage=="HD" || this.state.storage=="S3"){
			return this.state.path
		}else if(this.state.storage=="DB"){
			if(strlen(this.state.data)>0 && strlen(this.state.type)>0){
				return 'data:' + this.state.type + ';base64,' + this.state.data
			}else{
				return '../noPhoto.png'
			}
		}else{
			return '../noPhoto.png'
		}
	}

	mouseOver(){
		if(this.state.showDragDrop===false){
			if(!this.state.showCount){
				this.setState({showCount: true})
			} 
		}
	}
	
	mouseOut(){
		if(this.state.showDragDrop===false){
			if(this.state.showCount){
				this.setState({showCount: false})
			}
		}
	}

	nextPrev(_id){
		if(_id!==false){
			var pathTemp = this.state.path
			var dataTemp = this.state.data
			var storageTemp = this.state.storage
			var typeTemp = this.state.type
			var _idTemp = false
			var prev = false
			var next = false
			var count = 0
			var current = 0
			this.state.list.map(d => {
				count = count + 1
				if(d._id==_id){
					_idTemp = d._id
					current = count
					if(d.storage=='S3'){
						pathTemp = 'https://s3.amazonaws.com/' + d.path + '/' + d.name
					}else{
						pathTemp = d.path + '/' + d.name
					}
					dataTemp = d.data
					storageTemp = d.storage
					typeTemp = d.type
				}else if(_idTemp===false){
					prev = d._id
				}else if(next===false){
					next = d._id
				}
			})
			this.setState({
				path:pathTemp,
				data:dataTemp,
				storage:storageTemp,
				type:typeTemp,
				prev,
				next,
				count,
				current,
				_id:_idTemp
			})
		}
	}

	register(){
		this.setState({
			showDragDrop:true,
			update:false,
			_idA:this.state._id,
			_id:''
		});
	}

	update(){
		this.setState({
			showDragDrop:true,
			update:true,
			confirmDelete: 0
		});
	}

	uploaded = (_id) => {
		if(this.props.api && (!this.props.requireIdRefToEdit || (this.props.requireIdRefToEdit===true && strlen(this.props.idRef)>0))){
			var data = {}
			data.status = 1
			data.pageName = this.props.pageName
			if(this.props.idRef){ data.ref = this.props.idRef }
			api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api + '_list',process.env.tokenApi,data,(res) => {
				if(res.res=="error"){
					openMsg({text:res.error,type:-1})
				}else{
					var pathTemp = this.state.path
					var dataTemp = this.state.data
					var storageTemp = this.state.storage
					var typeTemp = this.state.type
					if(_id===false){
						pathTemp = '../noPhoto.png'
						dataTemp = ''
						storageTemp = ''
						typeTemp = ''
					}
					var _idTemp = false
					var prev = false
					var next = false
					var count = 0
					var current = 0
					res.data.map(d => {
						count = count + 1
						if(d._id==_id || (_id===false && _idTemp===false)){
							_idTemp = d._id
							current = count
							if(d.storage=='S3'){
								pathTemp = 'https://s3.amazonaws.com/' + d.path + '/' + d.name
							}else{
								pathTemp = d.path + '/' + d.name
							}
							dataTemp = d.data
							storageTemp = d.storage
							typeTemp = d.type
						}else if(_idTemp===false){
							prev = d._id
						}else if(next===false){
							next = d._id
						}
					})
					this.setState({
						showDragDrop:false,
						list:res.data,
						path:pathTemp,
						data:dataTemp,
						storage:storageTemp,
						type:typeTemp,
						prev,
						next,
						count,
						current,
						_id:_idTemp
					})
				}
			})
		}else{
			this.setState({
				showDragDrop:false,
				list:[],
				path:'../noPhoto.png',
				data:'',
				storage:'',
				type:'',
				prev:false,
				next:false,
				count: 0,
				current: 0,
				_id:'',
				_idA:''
			})
		}
	}

	toggerShowDragDrop(){
		this.setState({showDragDrop:!this.state.showDragDrop});
	}

  	render(){
		return (
			<>
				<div className={setCols(12,12,12,12,12) + ' d-flex mh-100 mw-100'}>
					<div className="basePhoto form-row withoutMargin">
						{!this.props.name ? (
							<div>Informe o nome</div>
						):!this.props.pageName ? (
							<div>Informe a pageName</div>
						):!this.props.api ? (
							<div>Informe a api de upload</div>
						):!this.props.storage ? (
							<div>Informe o storage, local de armazenamento do arquivo (HD, DB ou S3)</div>
						):(this.props.storage!="HD" && this.props.storage!="DB" && this.props.storage!="S3") ? (
							<div>As opções de storage são HD, DB ou S3</div>
						):(this.props.storage=="HD" && !this.props.path) ? (
							<div>Informe o path do local de armazenamento do arquivo</div>
						):(this.props.storage=="S3" && !this.props.bucket) ? (
							<div>Informe o bucket do local de armazenamento do arquivo no S3 da AWS</div>
						):(
							<>
								{(this.state.showDragDrop===false) ? (
									<img className={setCols(12,12,12,12,12) + " photo"} id={"photo" + this.props.name} src={this.loadImage()}/>
								):null}
								{this.state.showDragDrop ? (
									<DropZone 
										{...this.props}
										name={"photoUpload" + this.props.name}
										callbackUploaded={this.uploaded}
										cols={setCols(12,12,12,12,12)}
										_id={this.state._id}
									/>
								):null}
								<div className={setCols(6,6,6,6,6) + " noselect photoButton" + (this.state.prev ? '' : " photoButtonDesactive") + " photoButtonLeft"} id="buttonLeft" onClick={() => this.nextPrev(this.state.prev)} onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()}>{"<"}</div>
								<div className={setCols(6,6,6,6,6) + " noselect photoButton" + (this.state.next ? '' : " photoButtonDesactive") + " photoButtonRight"} id="buttonRight" onClick={() => this.nextPrev(this.state.next)} onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()}>{">"}</div>
								<div className={"photoCount noselect" + (this.state.showCount ? ' photoCountHover' : '')} onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()}>{this.state.current + '/' + this.state.count}</div>
								{this.state.count > 0 ? (
									<img className={"photoEdit noselect" + (this.state.showCount ? ' photoCountHover' : '')} id={"photoEdit" + this.props.name} src={'../edit.png'} onClick={() => this.update()}  onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()}/>
								):null}
								<div className={"photoAddDel noselect photoAdd" + (this.state.showCount ? ' photoCountHover' : '')} onClick={() => this.register()} id="buttonAdd" onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()}>+</div>
								<div className={"photoAddDel noselect photoDel" + (this.state.showCount ? ' photoCountHover' : '') + (this.state.confirmDelete==2 ? ' photoDelDisable' : '')} onClick={() => this.delete()} id="buttonDel" onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()} disabled={(this.state.confirmDelete==2 ? true : false)}>{(this.state.confirmDelete>0 ? 'Confirma?' : 'Excluir')}</div>
								<div className={"photoBack noselect photoBack" + (this.state.showCount ? ' photoCountHover' : '')} onClick={() => this.back()} id="buttonDel" onMouseOver={() => this.mouseOver()} onMouseOut={() => this.mouseOut()}>Voltar</div>
							</>
						)}
					</div>
				</div>
				<style jsx>{`
					.basePhoto {
						box-shadow: 0px 0px 10px #999999;
						border-radius:${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						position: relative;
						min-width: 100%;
						height: 100%;
						min-height:${(this.props.minHeight ? this.props.minHeight : '200px')};
						align-items: center;
						justify-content: center;
						display:flex;	
						background-color:${(this.props.backgroundColor ? this.props.backgroundColor : '#aaa' )};
						padding: 10px;
					} 
					.photo {
						width:100%;
						border:0px;
						border-style: solid;
						border-color: rgb(50,90,120);
						position:relative;
					}  
					.photoCount {
						position:absolute;
						bottom:0px;
						left:-50px;
						width:100px;
						margin-left:50%;
						text-align: center;
						background-color: rgb(0,40,70);
						color: white;
						height:40px;
						display:${this.state.showDragDrop ? 'none' : 'flex'};
						align-items: center;
						justify-content: center;
						border-top-left-radius: 20px;
						border-top-right-radius: 20px;
						font-weight: bold;
						cursor: pointer;
						opacity: 0;

						-webkit-transition: .8s all;
						-moz-transition: .8s all;
						-o-transition: .8s all;
						transition: .8s all;
					}
					.photoButton {
						height: 100%;
						position: absolute;
						color: #fff;
						background-color: rgb(0,40,70);
						align-items: center;
						justify-content: center;
						font-weight: bold;
						font-size: 96px;
						opacity: 0;
						cursor: pointer;
						display:${this.state.showDragDrop ? 'none' : 'flex'};

						-webkit-transition: .8s all;
						-moz-transition: .8s all;
						-o-transition: .8s all;
						transition: .8s all;
					}
					.photoButton.photoButtonDesactive {
						background-color: rgb(50,50,50);
						color:rgb(170,170,170);
					}
					@media only screen and (max-width: 400px){
						.photoButton {
							font-size: 48px;
						}
					}
					.photoButtonLeft {
						top: 0px;
						left: 0px;
						border-top-left-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						border-bottom-left-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
					}
					.photoButtonLeft:hover {
						opacity: 0.5;
					}
					.photoButtonRight {
						top: 0px;
						right: 0px;
						border-top-right-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						border-bottom-right-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
					}
					.photoButtonRight:hover {
						opacity: 0.5;
					}
					.photoAdd {
						width:40px;
						height:40px;
						position: absolute;
						bottom: 0px;
						left: 0px;
						border-top-right-radius: 20px;
						border-bottom-right-radius: 0px;
						border-top-left-radius: 0px;
						border-bottom-left-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						padding: 5px;
						cursor: pointer;
						color:white;
						font-weight:bold;
						align-items: center;
						justify-content:center;
						text-align:center;
						font-size:24px;
						z-index:501;
						opacity: 0;
						
						background-color:  rgba(0,40,70,1);
						display:${(this.state.showDragDrop || (this.props.requireIdRefToEdit===true && strlen(this.props.idRef)==0) || (this.props.limit && this.props.limit<=count(this.state.list))) ? 'none' : 'block'};

						-webkit-transition: .8s all;
						-moz-transition: .8s all;
						-o-transition: .8s all;
						transition: .8s all;
					}
					.photoAdd:hover {
						background-color:  rgba(50,100,150,1);
					}
					.photoDel {
						height:40px;
						position: absolute;
						bottom: 0px;
						right: 0px;
						border-top-right-radius: 0px;
						border-bottom-right-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						border-top-left-radius: 20px;
						border-bottom-left-radius: 0px;
						padding: 5px;
						padding-left: 15px;
						padding-right: 15px;
						cursor: pointer;
						color:white;
						align-items: center;
						justify-content:center;
						text-align:center;
						font-size:16px;
						z-index:501;
						opacity: 0;

						background-color:  rgba(150,30,0,1);
						display:${(this.state.showDragDrop && this.state.update) ? 'flex' : 'none'};

						-webkit-transition: .8s all;
						-moz-transition: .8s all;
						-o-transition: .8s all;
						transition: .8s all;
					}
					.photoDel:hover {
						background-color:  rgba(210,30,10,1);
					}
					.photoDelDisable,.photoDelDisable:hover {
						background-color:#343a40;
						color:#6c757d;
					}
					.photoEdit {
						width:40px;
						position: absolute;
						bottom: 0px;
						right: 0px;
						border-top-right-radius: 0px;
						border-bottom-right-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						border-top-left-radius: 20px;
						border-bottom-left-radius: 0px;
						padding: 5px;
						background-color:  rgba(0,40,70,1);
						cursor: pointer;
						display:${(this.state.showDragDrop || (this.props.requireIdRefToEdit===true && strlen(this.props.idRef)==0)) ? 'none' : 'block'};
						opacity: 0;

						-webkit-transition: .8s all;
						-moz-transition: .8s all;
						-o-transition: .8s all;
						transition: .8s all;
					}
					.photoEdit:hover {
						background-color:  rgba(50,100,150,1);
					}
					.photoBack {
						height:40px;
						position: absolute;
						bottom: 0px;
						left: 0px;
						border-top-right-radius: 20px;
						border-bottom-right-radius: 0px;
						border-top-left-radius: 0px;
						border-bottom-left-radius: ${(this.props.borderRadius ? this.props.borderRadius : '10px')};
						padding: 5px;
						padding-left: 15px;
						padding-right: 15px;
						cursor: pointer;
						color:black;
						align-items: center;
						justify-content:center;
						text-align:center;
						font-size:16px;
						z-index: 501;
						background-color:  rgba(230,200,0,1);
						display:${this.state.showDragDrop ? 'flex' : 'none'};
						
						-webkit-transition: .8s all;
						-moz-transition: .8s all;
						-o-transition: .8s all;
						transition: .8s all;
					}
					.photoBack:hover {
						background-color:  rgba(255,220,0,1);
					}
					.photoCountHover,.photoCount:hover,.photoAddDel:hover {
						opacity: 1;
					}
				`}</style>
			</>
		)
  	}
}
/* ########## Definições das propriedades (props): ##########

api:    É a api que faz a interação direta de alteração do banco de dados.
callbackChange:     Função de retorno do change.
callbackSetForm:    Função de retorno após a alteração do checkbox.
cols:   É a definição de colunas do modo responsivo.
data:   É o objeto de dados do formulário principal.
idRef:  É o ID do cadastro principal ao qual esse checkbox está ligado.
label:  É o rótulo do checkbox.
msg:    É um objeto e os atributos/propriedades desse objeto definem a mensagem que será exibida:
        
        {confirm:'Deseja alterar?'},
        {success:'Alterado com sucesso!'}

name:   É o nome do checkbox.
text:   É o texto que aparece a direita do checkbox.
value:  É o valor do checkbox.

########## Definições das propriedades (props): ########## */

import {setCols,strlen} from '../libs/functions'
import Dta from './data-table-adapter'
import {api} from '../libs/api'
import { openMsg,closeMsg } from './msg'
import { openLoading,closeLoading } from './loading'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    change = (e) => {
        if(e.target.checked!=null){
            var checked = e.target.checked
            if(strlen(this.props.api)>0){
                if(this.props.msg){
                    if(this.props.msg.confirm){
                        openMsg({text:this.props.msg.confirm,type:-1,textYes:'Sim',textNo:'Não',callbackYes:() => this.save(checked)})
                    }else{
                        this.save(e.target.checked)
                    }
                }
            }else if(this.props.callbackChange){
                if(e.target.checked===false){
                    e.target.value = 0
                }else{
                    e.target.value = 1
                }
                this.props.callbackChange(e)
            }
        }
    }

    save = (checked) => {
        if(strlen(this.props.idRef)==0){
            openMsg({text:'Falta o idRef! Fale com o administrador do sistema.',type:-1})
        }else if(strlen(this.props.name)==0){
            openMsg({text:'Falta o name! Fale com o administrador do sistema.',type:-1})
        }else if(strlen(this.props.api)==0){
            openMsg({text:'Falta a api! Fale com o administrador do sistema.',type:-1})
        }else{
            var data = {}
            if(strlen(this.props.data)){
                data = this.props.data
            }
            data._id = this.props.idRef
            if(checked===false){
                data[this.props.name] = 0
            }else{
                data[this.props.name] = 1
            }
            openLoading({count:[1,5,60]})
            api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,data,(res) => {
                if(res.res=="error"){
                    openMsg({text:res.error,type:-1})
                }else{
                    if(strlen(this.props.msg.success)>0){
                        openMsg({text:this.props.msg.success,type:1})
                    }else{
                        openMsg({text:'Dados alterados com sucesso!',type:1})
                    }
                    if(this.props.callbackSetForm){
                        this.props.callbackSetForm(res.data[0])
                    }
                }
                closeLoading()
            })
        }
    }

    render(){
        return (
            <>
                <div className={this.props.cols}>
                    {this.props.label ? <label>{this.props.label}</label> : null}

                    <div className="input-group">
                        <div className="input-group-prepend">
                            <div name={"base" + this.props.name} className={"input-group-text form-control-checkbox" + (this.props.value==1 ? ' stdRed' : '')}>
                                <input type="checkbox" name={this.props.name} checked={this.props.value==1 ? true : false} onChange={this.change} />
                            </div>
                        </div>
                        <div className={"checkboxText form-control" + (this.props.value==1 ? ' stdRed' : '')} name={"texto" + this.props.name}>
                            {this.props.text}
                        </div>
                    </div>
                </div>
                <style jsx>{`
					.checkboxText {
                        overflow:auto;
                        white-space: nowrap;
                    }
                `}</style>
            </>
        )
    }
}
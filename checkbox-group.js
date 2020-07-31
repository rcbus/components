/* ########## Definições das propriedades (props): ##########



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
        /*console.log(this.props.value)
        console.log(e.target.checked)*/
        if(e.target.checked!=null){
            var checked = e.target.checked
            if(this.props.msg){
                if(this.props.msg.confirm){
                    openMsg({text:this.props.msg.confirm,type:-1,textYes:'Sim',textNo:'Não',callbackYes:() => this.save(checked)})
                }else{
                    this.save(e.target.checked)
                }
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
                        <div className={"form-control" + (this.props.value==1 ? ' stdRed' : '')} name={"texto" + this.props.name}>
                            {this.props.text}
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
/* ########## Definições das propriedades (props): ##########

api: Api dos dados da lista
callbackClickCell: Função de retorno após clicar no item da lista
callbackDesactive: Função de retorno após clicar em excluir
collection: Coleção da lista
cols: Colunas que o componente vai ocupar em cada tela responsiva
label: Etiqueta do componente
msg: Mensagem de confirmação antes de apresentar a lista
msgDesactive: Mensagem de confirmação antes de excluir
name: Nome do componente
placeholder: Texto que aparece quando o componente estiver vazio
value: Valor do componente

########## Definições das propriedades (props): ########## */

import {setCols,strlen,count} from '../libs/functions'
import Dta from '../components/data-table-adapter'
import {api} from '../libs/api'
import { openMsg,closeMsg } from '../components/msg'
import { openLoading,closeLoading } from '../components/loading'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search:'',
            list:null,
            config:[],
            show:false
        }
    }

    componentDidMount(){
        this.getListData()
    }

    change = (e) => {
        this.setState({
            search:e
        })
    }

    click = () => {  
        if(strlen(this.props.value)>0){      
            if(strlen(this.props.apiForm)==0){
                if(this.props.msgDesactive){
                    openMsg({text:this.props.msgDesactive,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                        if(this.props.callbackDesactive){
                            this.props.callbackDesactive()
                        }
                        closeMsg()
                    }})
                }else if(strlen(this.props.msg.d.confirm)>0){
                    openMsg({text:this.props.msg.d.confirm,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                        if(this.props.callbackDesactive){
                            this.props.callbackDesactive()
                        }
                        closeMsg()
                    }})
                }else{
                    if(this.props.callbackDesactive){
                        this.props.callbackDesactive()
                    }
                }
            }else{
                if(this.props.msgDesactive){
                    openMsg({text:this.props.msgDesactive,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                        this.desactive()
                        closeMsg()
                    }})
                }else if(strlen(this.props.msg.d.confirm)>0){
                    openMsg({text:this.props.msg.d.confirm,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                        this.desactive()
                        closeMsg()
                    }})
                }else{
                    this.desactive()
                }
            }
        }
    }

    clickCell = (e) => {
        if(typeof e.target !== 'undefined'){
            var id = e.target.getAttribute('name').substr(0,e.target.getAttribute('name').indexOf('#'))
        }else{
            var id = e
        }
        var formTemp = false
        Object.keys(this.state.list).map(k => {
            if(formTemp===false){
                if(this.state.list[k]._id==id){
                    formTemp = this.state.list[k]
                }
            }
        })
        if(formTemp!==false){
            if(strlen(this.props.apiForm)==0){
                if(this.props.callbackClickCell){
                    this.props.callbackClickCell(formTemp)
                }
                this.close()
            }else{
                if(strlen(this.props.idRef)==0){
                    openMsg({text:'Falta o idRef! Fale com o administrador do sistema.',type:-1})
                    this.close()
                }else if(strlen(this.props.name)==0){
                    openMsg({text:'Falta o name! Fale com o administrador do sistema.',type:-1})
                    this.close()
                }else if(strlen(this.props.columns)==0){
                    openMsg({text:'Falta o columns! Fale com o administrador do sistema.',type:-1})
                    this.close()
                }else{
                    var update = true
                    var text = ''
                    this.props.columns.map(c => {
                        if(strlen(formTemp[c])==0){
                            update = false
                        }else{
                            if(strlen(text)>0){
                                text += ' - '
                            } 
                            text += formTemp[c]
                        }
                    })
                    if(update===false){
                        openMsg({text:'Coluna não encontrada na linha! Fale com o administrador do sistema.',type:-1})
                        this.close()
                    }else if(strlen(text)==0){
                        openMsg({text:'Houve uma falha o text está vazio! Fale com o administrador do sistema.',type:-1})
                        this.close()
                    }else if(strlen(formTemp._id)==0 && strlen(this.props.columnId)==0){
                        openMsg({text:'Houve uma falha o _id da linha está vazio! Fale com o administrador do sistema.',type:-1})
                        this.close()
                    }else if(strlen(formTemp[this.props.columnId])==0 && strlen(this.props.columnId)>0){
                        openMsg({text:'Houve uma falha o ' + this.props.columnId + ' da linha está vazio! Fale com o administrador do sistema.',type:-1})
                        this.close()
                    }else{
                        var data = {}
                        if(strlen(this.props.data)){
                            data = this.props.data
                        }
                        data._id = this.props.idRef
                        if(strlen(this.props.columnId)==0){
                            data[this.props.name] = formTemp._id
                        }else{
                            data[this.props.name] = formTemp[this.props.columnId]
                        }
                        data[this.props.name + '_text'] = text
                        this.sendApi(data,() => {
                            if(strlen(this.props.msg.c.success)>0){
                                openMsg({text:this.props.msg.c.success,type:1})
                            }else{
                                openMsg({text:'Dados alterados com sucesso!',type:1})
                            }
                        })
                    }
                }
            }
        }else{
            this.close()
        }
    }

    close = () => {
        this.setState({
            show:false
        })
    }

    desactive(){
        if(strlen(this.props.idRef)==0){
            openMsg({text:'Falta o idRef! Fale com o administrador do sistema.',type:-1})
            this.close()
        }else if(strlen(this.props.name)==0){
            openMsg({text:'Falta o name! Fale com o administrador do sistema.',type:-1})
            this.close()
        }else{
            var data = {}
            if(strlen(this.props.data)){
                data = this.props.data
            }
            data._id = this.props.idRef
            data.status = 0
            data[this.props.name] = ''
            data[this.props.name + '_text'] = ''
            this.sendApi(data,() => {
                if(strlen(this.props.msg.d.success)>0){
                    openMsg({text:this.props.msg.d.success,type:1})
                }else{
                    openMsg({text:'Desativado com sucesso!',type:1})
                }
            })
        }
    }

    getListData = (e) => {
        var data = {}
        data.condition = {}
        data.config = this.state.config
        data.search = this.state.search
        if(typeof e === 'undefined'){
          data.condition = {$or:[{status:1},{status:2}]}
        }else{
          data.condition = e
        }
        api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,data,(res) => {
          if(res.res=="error"){
            openMsg({text:res.error,type:-1})
          }else{
            this.setState({
                list:res.data.data,
                config:res.data.config
            })
          }
        })
    }

    open = () => {
        if(!this.props.msg){
            this.setState({show:true})
        }else if(strlen(this.props.msg.c)>0){
            if(strlen(this.props.msg.c.confirm)>0){
                openMsg({text:this.props.msg.c.confirm,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                    this.setState({show:true})
                    closeMsg()
                }})
            }else{
                openMsg({text:this.props.msg,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                    this.setState({show:true})
                    closeMsg()
                }})
            }
        }else{
            openMsg({text:this.props.msg,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => {
                this.setState({show:true})
                closeMsg()
            }})
        }
    }

    sendApi(data,callback){
        openLoading({count:[1,5,60]})
        api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.apiForm,process.env.tokenApi,data,(res) => {
            if(res.res=="error"){
                openMsg({text:res.error,type:-1})
            }else{
                if(this.props.callbackSetForm){
                    this.props.callbackSetForm(res.data[0])
                }
                if(callback){
                    callback()
                }
            }
            closeLoading()
            this.close()
        })
    }

    render(){
        return (
            <>
                <div name={"panel_" + this.props.name} className={"panel col-12 " + (this.state.show ? "d-block" : "d-none")}>
                    <div className="p-2 p-sm-5 col-12">
                        <div className="form-row">
                            <div className={setCols(12,8,9,10,11,1)}>
                                <input type="text" className="form-control" value={this.state.search} onChange={(e) => this.change(e.target.value)} onKeyDown={(e) => (e.key=="Enter" ? this.getListData() : null)} placeholder="Pesquise Aqui"/>
                            </div>
                            <div className={setCols(12,4,3,2,1)}>
                                <button type="button" className="btn btn-block btn-warning" onClick={() => this.close()}>Fechar</button>
                            </div>
                        </div>
                        <Dta 
                            collection={this.props.collection} 
                            data={this.state.list}
                            config={this.state.config}
                            withoutTitle={true}
                            callbackClickCell={this.clickCell}
                        />
                    </div>
                </div>
                <div className={this.props.cols}>
                    {this.props.label ? <label>{this.props.label}</label> : null}
                    <div className="input-group">
                        <input type="text" name={this.props.name} className="form-control cursor" value={this.props.value} placeholder={this.props.placeholder ? this.props.placeholder : null} onClick={() => this.open()} readOnly={true}/>
                        <div className="input-group-append">
                            <button className={"btn btn-danger"} type="button" name={"desactive_" + this.props.name} onClick={() => this.click()} disabled={(strlen(this.props.value)==0 ? true : false)}>Excluir</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
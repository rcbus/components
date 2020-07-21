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

import {setCols} from '../libs/functions'
import Dta from '../components/data-table-adapter'
import {api} from '../libs/api'
import { openMsg,closeMsg } from '../components/msg'

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
        if(this.props.callbackDesactive){
            if(this.props.msgDesactive){
                openMsg({text:this.props.msgDesactive,textYes:'Sim',textNo:'Não',callbackYes:() => {
                    this.props.callbackDesactive()
                    closeMsg()
                }})
            }else{
                this.props.callbackDesactive()
            }
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
        api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/api/' + this.props.api,process.env.tokenApi,data,(res) => {
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

    close = () => {
        this.setState({
            show:false
        })
    }

    open = () => {
        if(!this.props.msg){
            this.setState({show:true})
        }else{
            openMsg({text:this.props.msg,textYes:'Sim',textNo:'Não',callbackYes:() => {
                this.setState({show:true})
                closeMsg()
            }})
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
            if(this.props.callbackClickCell){
                this.props.callbackClickCell(formTemp)
            }
        }
        this.close()
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
                            <button className="btn btn-danger" type="button" name={"desactive_" + this.props.name} onClick={() => this.click()}>Excluir</button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
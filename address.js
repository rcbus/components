import React from 'react'

import Form,{formUpdate} from './form'
import { setCols,strlen,verifyVariable,getSession } from '../libs/functions'
import { api,getListSelect } from '../libs/api'
import { openMsg } from './msg'
import { openLoading, closeLoading } from './loading'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listEstado:[],
            listCidade:[],
            ufAnterior:false,
            lastData:{}
        }
    }

    componentDidMount(){
        if(getSession("userData")!==false){
            getListSelect('api/cadastro/estado',{value:'uf',text:'uf'},this.setListEstado)
        }
    }

    componentDidUpdate(){
        if(this.state.lastData._id!=this.props.data._id || this.state.lastData['uf' + this.props.type]!=this.props.data['uf' + this.props.type]){
            if(strlen(this.props.data['uf' + this.props.type])>0){
                if(this.props.data['uf' + this.props.type]!=this.state.ufAnterior){
                    var loading = true
                    if(strlen(this.props.data['city' + this.props.type + '_text'])>0){
                        this.setState({ listCidade:[{value:this.props.data['city' + this.props.type],text:this.props.data['city' + this.props.type + '_text']}] })
                        loading = undefined
                    }
                    this.setState({ufAnterior:this.props.data['uf' + this.props.type]})
                    if(getSession("userData")!==false){
                        getListSelect('api/cadastro/cidade',{value:'_id',text:'name'},this.setListCidade,{status:1,uf:this.props.data['uf' + this.props.type]},loading)
                    }
                }
            }else{
                this.setState({ 
                    listCidade:[],
                    ufAnterior:false
                })
            }
            this.setState({ lastData:this.props.data })
        }
    }

    handleDesactiveAddress = () => {
        var data = this.props.data
        if(verifyVariable(this.props.msg)){
            if(verifyVariable(this.props.msg.d)){
                if(verifyVariable(this.props.msg.d.confirm)){
                    openMsg({text:this.props.msg.d.confirm,type:0,textYes:'Sim',textNo:'Não',callbackYes:() => this.save(data)})
                }else{
                    this.save(data)
                }
            }else{
                this.save(data)
            }
        }else{
            this.save(data)
        }
    }

    handleFormUpdate = (form) => {
        formUpdate(form,this.props.list,this.props.callbackSetForm,this.props.callbackSetList)
    }

    save = (data) => {

        data['cep' + this.props.type] = ''
        data['address' + this.props.type] = ''
        data['number' + this.props.type] = ''
        data['complement' + this.props.type] = ''
        data['neighborhood' + this.props.type] = ''
        data['uf' + this.props.type] = ''
        data['uf' + this.props.type + '_text'] = ''
        data['city' + this.props.type] = ''
        data['city' + this.props.type + '_text'] = ''

        data._type = 'save'
        openLoading({count:[1,5,60]})
        api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,data,(res) => {
            if(res.res=="error"){
                openMsg({text:res.error,type:-1})
            }else{
                if(verifyVariable(this.props.msg)){
                    if(verifyVariable(this.props.msg.d)){
                        if(verifyVariable(this.props.msg.d.success)){
                            openMsg({text:this.props.msg.d.success,type:1})
                        }else{
                            openMsg({text:'Endereço excluído com sucesso!',type:1})
                        }
                    }else{
                        openMsg({text:'Endereço excluído com sucesso!',type:1})
                    }
                }else{
                    openMsg({text:'Endereço excluído com sucesso!',type:1})
                }

                this.handleFormUpdate(res.data[0])
            }  
            closeLoading()
        })
    }

    setListEstado = (data) => {
        this.setState({ listEstado:data })
    }

    setListCidade = (data) => {
        this.setState({ listCidade:data })
    }
    
    render(){
        return(
            <>
                {!this.props.type ? (
                    <>Informe o type</>
                ):!(this.props.type >=1 && this.props.type <=3) ? (
                    <>O type deve ser 1, 2 ou 3</>
                ):!this.props.data ? (
                    <>Informe o data</>
                ):!this.props.list ? (
                    <>Informe o list</>
                ):!this.props.api ? (
                    <>Informe o api</>
                ):!this.props.callbackSetForm ? (
                    <>Informe o callbackSetForm</>
                ):!this.props.callbackSetList ? (
                    <>Informe o callbackSetList</>
                ):(
                    <Form 
                        name={this.props.name}
                        api={this.props.api}
                        data={this.props.data}
                        callbackUpdate={(form) => this.handleFormUpdate(form)}
                        callbackSetForm={this.props.callbackSetForm}
                        withoutMargin={true}
                        msg={(this.props.msg ? this.props.msg : {
                            u:{confirm:'',success:'Endereço salvo com sucesso!'}
                        })}
                        content={[
                            {
                                label:(<>CEP</>),
                                cols:setCols(12,4,3,3,2),
                                name:'cep' + this.props.type,
                                type:'text',
                                className:'text-center'
                            },
                            {
                                label:(<>Endereço</>),
                                cols:setCols(12,8,7,7,5),
                                name:'address' + this.props.type,
                                type:'text'
                            },
                            {
                                label:(<>Nº <i>(opcional)</i></>),
                                cols:setCols(12,4,2,2,2),
                                name:'number' + this.props.type,
                                type:'text',
                                className:'text-center'
                            },
                            {
                                label:(<>Complemento <i>(opcional)</i></>),
                                cols:setCols(12,8,5,5,3),
                                name:'complement' + this.props.type,
                                type:'text',
                                className:'text-center'
                            },
                            {
                                label:(<>Bairro</>),
                                cols:setCols(12,12,7,7,5),
                                name:'neighborhood' + this.props.type,
                                type:'text'
                            },
                            {
                                label:(<>UF</>),
                                cols:setCols(12,2,2,1,1),
                                name:'uf' + this.props.type,
                                type:'select',
                                optionNull:true,
                                data:this.state.listEstado
                            },
                            {
                                label:(<>Cidade</>),
                                cols:setCols(12,10,10,11,6),
                                name:'city' + this.props.type,
                                type:'select',
                                optionNull:(verifyVariable(this.props.data['uf' + this.props.type]) ? (strlen(this.props.data['uf' + this.props.type]) > 0 ? 'ESCOLHA UMA CIDADE' : 'ESCOLHA UM ESTADO') : 'ESCOLHA UM ESTADO'),
                                optionNullDisabled:true,
                                data:this.state.listCidade
                            }
                        ]}
                        button={[
                            {
                                cols:setCols(12,12,6,4,3),
                                type:'button',
                                className:'btn-lg btn-success btn-block mt-3',
                                name:'save',
                                innerHTML:(this.props.saveButtonText ? this.props.saveButtonText : 'Salvar Endereço')
                            },
                            this.props.desactiveButtonText ? {
                                cols:setCols(12,12,6,4,3),
                                type:'button',
                                className:'btn-lg btn-danger btn-block mt-3',
                                name:'desactiveAddress',
                                innerHTML:this.props.desactiveButtonText,
                                callback:this.handleDesactiveAddress
                            }:{}
                        ]}
                    />
                )}
            </>
        )
    }
}
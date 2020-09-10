import React from 'react'

import Form,{formUpdate,formModify,formRegister} from './form'
import { setCols,strlen,verifyVariable,getSession } from '../libs/functions'
import { api,getListSelect } from '../libs/api'
import { openMsg } from './msg'
import { openLoading, closeLoading } from './loading'
import Dta from './data-table-adapter'

export default class extends React.Component {
    handleFormUpdate = (form) => {
        formUpdate(form,this.props.list,this.props.callbackSetForm,this.props.callbackSetList)
    }

    constructor(props) {
        super(props);
        this.state = {
            listEstado:[],
            data:{_id:'',status:''},
            list:[],
            next:false,
            prev:false,
            slide:false,
            update:0
        }
    }

    componentDidMount(){
        if(getSession("userData")!==false){
            getListSelect('api/cadastro/estado',{value:'uf',text:'uf'},this.setListEstado)
        }
    }

    cancel = () => {
        this.setState({slide:false})
    }

    handleFormUpdate = (form,list) => {
        this.cancel()
        this.setState({update:(this.state.update+1)})
        formUpdate(form,(list ? list : this.state.list),this.setFormVehicle,this.setListVehicle)
    }

    modify = (id,list) => {
        formModify(id,(list ? list : this.state.list),this.setFormVehicle,this.setListVehicle,this.setNext,this.setPrev,true,this.setSlide)
    }

    register = () => {
        this.setNext(false)
        this.setPrev(false)
        formRegister(true,this.setSlide,{_id:''},this.setFormVehicle)
    }

    setFormVehicle = (form) => {
        this.setState({data: form})
    }

    setListVehicle = (list) => {
        this.setState({list: list})
    }

    setNext = (next) => {
        this.setState({next: next})
    }

    setPrev = (prev) => {
        this.setState({prev: prev})
    }

    setSlide = (slide) => {
        this.setState({slide: slide})
    }

    setListEstado = (data) => {
        this.setState({ listEstado:data })
    }

    render(){
        return(
            <>
                <Form 
                    slide={this.state.slide}
                    idRef={this.props.idRef}
                    api='api/cadastro/veiculo'
                    data={this.state.data}
                    next={this.state.next}
                    prev={this.state.prev}
                    callbackUpdate={(form) => this.handleFormUpdate(form)}
                    callbackSetForm={(form) => this.setState({data: form})}
                    callbackNext={this.modify}
                    callbackPrev={this.modify}
                    withoutMargin={true}
                    margin='mb-2'
                    msg={{
                        c:{confirm:'',success:'Veículo cadastro com sucesso!'},
                        u:{confirm:'',success:'Veículo salvo com sucesso!'},
                        d:{confirm:'Deseja excluir esse veículo?',success:'Veículo excluído com sucesso!'}
                    }}
                    content={[
                        {
                            cols:setCols(12,6,4,3,3),
                            label:'ID',
                            type:'_id',
                            name:'_id'
                        },
                        {
                            cols:setCols(12,6,4,3,3),
                            label:'Status',
                            type:'status',
                            name:'status',
                            mask:{'':'CADASTRO','1':'ATIVO','0':'DESATIVADO','2':'BLOQUEADO'},
                            className:{'':'stdSilver','1':'stdGreen','0':'stdRed','2':'stdPurple'}
                        },
                        {
                            cols:setCols(12,5,4,2,2),
                            label:'Tipo',
                            type:'select',
                            name:'type',
                            optionNull:true,
                            data:[
                                {value:0,text:'TOCO'},
                                {value:1,text:'TRUCK'}
                            ]
                        },
                        {
                            label:'Placa',
                            cols:setCols(12,5,4,3,3),
                            name:'board',
                            type:'text',
                            className:'text-center'
                        },
                        {
                            label:'UF',
                            cols:setCols(12,2,2,1,1),
                            name:'uf',
                            type:'select',
                            optionNull:true,
                            data:this.state.listEstado
                        },
                        {
                            label:'RENAVAM',
                            cols:setCols(12,6,3,3,3),
                            name:'renavam',
                            type:'text',
                            className:'text-center'
                        },
                        {
                            label:'RNTRC',
                            cols:setCols(12,6,3,3,3),
                            name:'rntrc',
                            type:'text',
                            className:'text-center'
                        },
                        {
                            cols:setCols(12,6,6,3,3),
                            label:'Cubagem (m³)',
                            type:'number',
                            precision:6,
                            name:'cubage',
                            className:'text-right'
                        },
                        {
                            cols:setCols(12,6,6,3,3),
                            label:'Tara (Kg)',
                            type:'number',
                            name:'tare',
                            className:'text-right'
                        }
                    ]}
                    button={[
                        {
                            cols:setCols(12,6,6,3,3),
                            type:'button',
                            className:'btn-lg btn-success btn-block mt-3',
                            name:'save',
                            innerHTML:'Salvar Veículo'
                        },
                        {
                            cols:setCols(12,6,6,3,2),
                            type:'button',
                            className:'btn-lg btn-warning btn-block mt-3',
                            name:'cancel',
                            innerHTML:'Cancelar',
                            callback:this.cancel
                        },
                        {
                            cols:setCols(12,6,6,3,2),
                            type:'button',
                            className:'btn-lg btn-danger btn-block mt-3',
                            name:'desactive',
                            innerHTML:'Excluir',
                            where:[{'status':'1'},{'status':'2'}]
                        },
                        {
                            cols:setCols(
                                12,
                                (verifyVariable(this.props.data) ? verifyVariable(this.props.data.status) ? this.props.data.status == 1 ? 6 : 12 : 12 : 12),
                                (verifyVariable(this.props.data) ? verifyVariable(this.props.data.status) ? this.props.data.status == 1 ? 6 : 12 : 12 : 12),
                                3,
                                2
                            ),
                            type:'button',
                            className:'btn-lg btn-primary btn-block mt-3',
                            name:'register',
                            innerHTML:'+ Cadastrar',
                            callback:this.register
                        }
                    ]}
                />

                <Dta 
                    idRef={this.props.idRef}
                    update={this.state.update}
                    margin='mt-3'
                    collection='cadastro_veiculo'
                    api='api/cadastro/veiculo'
                    editable={getSession("userData").type=='admin' ? true : false}
                    callbackRegister={this.register}
                    callbackClickCell={this.modify}
                />
            </>
        )
    }
}
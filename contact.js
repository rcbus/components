import React from 'react'

import Form,{formUpdate} from './form'
import { setCols,strlen,verifyVariable,getSession } from '../libs/functions'
import { api,getListSelect } from '../libs/api'
import { openMsg } from './msg'
import { openLoading, closeLoading } from './loading'

export default class extends React.Component {
    handleFormUpdate = (form) => {
        formUpdate(form,this.props.list,this.props.callbackSetForm,this.props.callbackSetList)
    }

    render(){
        return(
            <>
                {!this.props.data ? (
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
                                label:(<>E-mail <i>(pode inserir vários separando por vírgula)</i></>),
                                cols:setCols(12,12,12,12,12),
                                name:'email',
                                type:'text'
                            },
                            {
                                label:(<>Celular <i>(xx) xxxxx-xxxx</i></>),
                                cols:setCols(12,6,6,3,3),
                                name:'cellphone',
                                type:'text',
                                className:'text-center'
                            },
                            {
                                label:(<>Tel. Fixo <i>(xx) xxxxx-xxxx</i></>),
                                cols:setCols(12,6,6,3,3),
                                name:'phone1',
                                type:'text',
                                className:'text-center'
                            },
                            {
                                label:(<>Tel. Fixo 2 <i>(xx) xxxxx-xxxx</i></>),
                                cols:setCols(12,6,6,3,3),
                                name:'phone2',
                                type:'text',
                                className:'text-center'
                            },
                            {
                                label:(<>Skype</>),
                                cols:setCols(12,6,6,3,3),
                                name:'skype',
                                type:'text'
                            }
                        ]}
                        button={[
                            {
                                cols:setCols(12,6,5,4,3),
                                type:'button',
                                className:'btn-lg btn-success btn-block mt-3',
                                name:'save',
                                innerHTML:(this.props.saveButtonText ? this.props.saveButtonText : 'Salvar Endereço')
                            }
                        ]}
                    />
                )}
            </>
        )
    }
}
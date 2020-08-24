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
                                cols:setCols(12,12,12,12,12),
                                name:'observation',
                                type:'textarea'
                            }
                        ]}
                        button={[
                            {
                                cols:setCols(12,6,5,4,3),
                                type:'button',
                                className:'btn-lg btn-success btn-block mt-3',
                                name:'save',
                                innerHTML:'Salvar Observação'
                            }
                        ]}
                    />
                )}
            </>
        )
    }
}
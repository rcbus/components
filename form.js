/*
Definições das propriedades (props):

api - Nome da API que será responsável pelo CRUDAB

callbackChange - A função que será executada toda vez que o formulário for alterado.

callbackClick - A função que será executada toda vez que houver um click em um botão do formulário.

callbackReset - A função que será executada para resetar o formulário.

collection - A coleção ou tabela do banco de dados

content - É um array de objetos que contém as definições de cada componente do form. 
          Exemplo:

          [
            {
              cols:setCols(12,12,12,12,12),
              label:'Livro Ata - Registre aqui fatos e informações importantes do dia-a-dia',
              type:'textarea',
              name:'ata',
              rows:'3'
            },
            {
              cols:setCols(12,6,4,3,2),
              type:'button',
              className:'btn-lg btn-success btn-block',
              name:'save',
              innerHTML:'Salvar'
              where:[{'status':'1'}]
            }
          ]

data - Dados do formulário

margin -  É uma classe adicional adicionada na div base do component, essa classe pode 
          ser específica definida em um css ou usando as definições do bootstrap como 
          por exemplo: 

          mt-2

          (obs: essa insere uma margem do tipo 2 no topo do objeto)

msg - É um objeto e os atributos/propriedades desse objeto são as iniciais do CRUDAB 
      e será a mensagem exibida para cada uma das situações como no exemplo abaixo:

      {
        c:{confirm:'',success:'Dados cadastrado com sucesso!'},
        u:{confirm:'',success:'Dados alterados com sucesso!'},
        d:{confirm:'Deseja desativar?',success:'Desativado com sucesso!'}
        a:{confirm:'Deseja ativar?',success:'Ativado com sucesso!'},
        b:{confirm:'Deseja deseja bloquear?',success:'Bloqueado com sucesso!'}
      }

resetEvery - Quanto true reseta o formulário toda vez que o mesmo é alterado.
*/

import { setCols,setSubState, getSession, sign } from '../libs/functions'
import { api } from '../libs/api'
import { openLoading, closeLoading } from './loading'
import { openMsg } from './msg';

export default class extends React.Component {
  constructor(props) {
    super(props);
  }

  onClick = (e) => {
    var form = this.props.data
    if(e.target.name=="cancel"){
      if(this.props.callbackReset){
        this.props.callbackReset()
      }
    }else if(e.target.name=="save"){
      if(form._id.length==0){
        form = sign(form)
        if(this.verifyMsgConfirm('c')){
          openMsg({text:this.verifyMsgConfirm('c'),type:0,callbackYes:() => this.save(form)})
        }else{
          this.save(form)
        }
      }else{
        if(this.verifyMsgConfirm('u')){
          openMsg({text:this.verifyMsgConfirm('u'),type:0,callbackYes:() => this.save(form)})
        }else{
          this.save(form)
        }
      }
    }else if(e.target.name=="desactive"){
      if(this.verifyMsgConfirm('d')!==false){
        openMsg({text:this.verifyMsgConfirm('d'),type:0,callbackYes:() => this.dab(form,'d'),textYes:'Sim',textNo:'Não'})
      }else{
        this.dab(form,'d')
      }
    }else if(e.target.name=="active"){
      if(this.verifyMsgConfirm('a')){
        openMsg({text:this.verifyMsgConfirm('a'),type:0,callbackYes:() => this.dab(form,'a'),textYes:'Sim',textNo:'Não'})
      }else{
        this.dab(form,'a')
      }
    }else if(e.target.name=="block"){
      if(this.verifyMsgConfirm('b')){
        openMsg({text:this.verifyMsgConfirm('b'),type:0,callbackYes:() => this.dab(form,'b'),textYes:'Sim',textNo:'Não'})
      }else{
        this.dab(form,'b')
      }
    }
  }

  save = (form) => {
    openLoading({count:[1,5,60]})
    api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/api/' + this.props.api,process.env.tokenApi,form,(res) => {
      if(res.res=="error"){
        openMsg({text:res.error,type:-1})
      }else{
        if(form._id.length==0){
          openMsg({text:(this.verifyMsgSuccess('c') ? this.verifyMsgSuccess('c') : 'Dados cadastrados com sucesso!'),type:1})
        }else{
          openMsg({text:(this.verifyMsgSuccess('u') ? this.verifyMsgSuccess('u') : 'Dados alterados com sucesso!'),type:1})
        }

        if(this.props.resetEvery===true){
          if(this.props.callbackReset){
            this.props.callbackReset()
          }
        }else{
          if(this.props.callbackUpdate){
            this.props.callbackUpdate()
          }
        }
      }  
      closeLoading()
      if(this.props.callbackEvery){
        this.props.callbackEvery()
      }
    })
  }

  dab = (form,type) => {
    if(type=='d'){
      form.status = 0
    }else if(type=='a'){
      form.status = 1
    }else if(type=='b'){
      form.status = 2
    } 
    openLoading({count:[1,5,60]})
    api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/api/' + this.props.api,process.env.tokenApi,form,(res) => {
      if(res.res=="error"){
        openMsg({text:res.error,type:-1})
      }else{
        if(type=='d'){
          openMsg({text:(this.verifyMsgSuccess('d') ? this.verifyMsgSuccess('d') : 'Dado desativado com sucesso!'),type:1})
        }else if(type=='a'){
          openMsg({text:(this.verifyMsgSuccess('a') ? this.verifyMsgSuccess('a') : 'Dado ativado com sucesso!'),type:1})
        }else if(type=='b'){
          openMsg({text:(this.verifyMsgSuccess('b') ? this.verifyMsgSuccess('b') : 'Dado bloqueado com sucesso!'),type:1})
        }
        
        if(this.props.resetEvery===true){
          if(this.props.callbackReset){
            this.props.callbackReset()
          }
        }else{
          if(this.props.callbackUpdate){
            this.props.callbackUpdate()
          }
        }
      }  
      closeLoading()
      if(this.props.callbackEvery){
        this.props.callbackEvery()
      }
    })
  }

  verifyWhere = (e) => {
    var where = false
    e.map(w => {
      Object.keys(w).map(k => {
        if(this.props.data[k]==w[k]){
          where = true
        }
      })
    })
    return where
  }

  verifyMsgConfirm = (e) => {
    var msg = false
    if(this.props.msg){
      if(this.props.msg[e]){
        if(this.props.msg[e].confirm){
          if(this.props.msg[e].confirm.length>0){
            msg = this.props.msg[e].confirm
          }
        }
      } 
    } 
    return msg
  }

  verifyMsgSuccess = (e) => {
    var msg = false
    if(this.props.msg){
      if(this.props.msg[e]){
        if(this.props.msg[e].success){
          if(this.props.msg[e].success.length>0){
            msg = this.props.msg[e].success
          }
        }
      } 
    } 
    return msg
  }

  render(){
    return (
      <div className="form-base form-row">
        {!this.props.collection ? (
          <div>Informe a collection</div>
        ):!this.props.api ? (
          <div>Informe a API</div>
        ):!this.props.content ? (
          <div>Informe o content</div>
        ):!this.props.data ? (
          <div>Informe o data</div>
        ):!this.props.callbackChange ? (
          <div>Informe o callbackChange</div>
        ):(
          Object.values(this.props.content).map(c => (
            (c.where ? this.verifyWhere(c.where) : true) ? (  
              <div key={c.name} className={c.cols + " " + this.props.margin}>
                {c.label ? (
                  <label>{c.label}</label>
                ):null}
                {c.type=='text' ? null:
                c.type=='textarea' ? (
                <textarea name={c.name} className="form-control" rows={c.rows ? c.rows : "5"} onChange={this.props.callbackChange} value={this.props.data[c.name]}></textarea>
                ):
                c.type=='button' ? (
                  <button type="button" name={c.name} className={"btn " + c.className} onClick={this.onClick}>{c.innerHTML}</button>
                ):null}
              </div>
            ):null
          ))
        )}
      </div>
    )
  }
}
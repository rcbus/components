/* ########## Definições das propriedades (props): ##########

api: Nome da API que será responsável pelo CRUDAB
callbackChange: (Não funciona se callbackSetForm estiver setado) A função que será executada 
                toda vez que o formulário for alterado.
callbackClick: A função que será executada toda vez que houver um click em um botão do formulário.
callbackNext: A função será executada ao clicar no botão next.
callbackPrev: A função será executada ao clicar no botão prev.
callbackRegister: A função será executada ao clicar no botão register.
callbackReset: A função que será executada para resetar o formulário.
callbackSetForm: A função que alterado o estado do form no componente pai.
callbackUpdate: A função que será executada para atualizar as informações do formulário.
callbackDab: A função que será executada quando finalizar o DAB.
collection: A coleção ou tabela do banco de dados
content:  É um array de objetos que contém as definições de cada componente do form. 
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
              innerHTML:'Salvar',
              where:[{'status':'1'}]
            },
            {
              cols:setCols(12,12,12,12,4),
              label:'Tipo Produto',
              type:'select',
              name:'productType',
              optionNull:true,
              data:[
                {value:1,text:'Teste 1'},
                {value:2,text:'Teste 2'}
              ]
            }
          ]
data: Dados do formulário
idRef: É o ID de referencia, quando uma informação está ligada a outra informação
margin: É uma classe adicional adicionada na div base do component, essa classe pode 
        ser específica definida em um css ou usando as definições do bootstrap como 
        por exemplo: 

        mt-2

        (obs: essa insere uma margem do tipo 2 no topo do objeto)
msg:  É um objeto e os atributos/propriedades desse objeto são as iniciais do CRUDAB 
      e será a mensagem exibida para cada uma das situações como no exemplo abaixo:

      {
        c:{confirm:'',success:'Dados cadastrado com sucesso!'},
        u:{confirm:'',success:'Dados alterados com sucesso!'},
        d:{confirm:'Deseja desativar?',success:'Desativado com sucesso!'},
        a:{confirm:'Deseja ativar?',success:'Ativado com sucesso!'},
        b:{confirm:'Deseja deseja bloquear?',success:'Bloqueado com sucesso!'}
      }
next: É um objeto contendo o próximo id da lista e uma função para seta-lo:
        
      {{id:next,set:clickCell}}

      OBS: Ou pode usar o next direto e usar a callbackNext.
notAdjustDecimal: Quando definido não ajusta as casas decimais dos números.
optionNull: Quando true cria a opção nulo. Quanto incluído um texto o mesmo aparece como opção.
optionNullDisabled: Quando true apresenta a opção nulo mas disabilita impedindo o usuario de escolher ela novamente depois.
prev: É um objeto contendo o id anterior da lista e uma função para seta-lo:
      
      {{id:prev,set:clickCell}}

      OBS: Ou pode usar o prev direto e usar a callbackPrev.
resetEvery: Quanto true reseta o formulário toda vez que o mesmo é alterado.
withoutMargin: Quando true tira a margem que tem no topo do formulário

########## Definições das propriedades (props): ########## */

import { setCols,setSubState, getSession, sign,decimal, zeroLeft,strlen,verifyVariable,count,strlower } from '../libs/functions'
import { api } from '../libs/api'
import { openLoading, closeLoading } from './loading'
import { openMsg, closeMsg } from './msg';
import CheckboxGroup from './checkbox-group'
import InputGroup from './input-group'

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.focus = React.createRef();
    this.state = {
      focus: 0,
      save:0
    }
  }

  componentDidUpdate(){
    if(this.props.focus){
      if(this.props.focus!=this.state.focus){
        if(this.focus.current != null){ 
          this.focus.current.focus() 
        }
        this.setState({focus:this.props.focus})
      }
    }
    if(this.props.save){
      if(this.props.save!=this.state.save){
        this.save(this.props.data)
        this.setState({save:this.props.save})
      }
    }
  }

  change = (e) => {
    if(typeof this.props.callbackSetForm !== 'undefined'){
      this.props.callbackSetForm({...this.props.data,[e.target.name]:e.target.value})
    }else if(typeof this.props.callbackChange !== 'undefined'){
      this.props.callbackChange(e)
    }
  }

  changeInputGroup = (name,form,columns) => {
    if(count(columns)>0 && verifyVariable(form._id)){
      var update = true
      var text = ''
      columns.map(c => {
        if(strlen(form[c])==0){
            update = false
        }else{
            if(strlen(text)>0){
                text += ' - '
            } 
            text += form[c]
        }
      })
      if(strlen(text)>0 && update===true){
        var formTemp = {}
        formTemp = {...formTemp,[name]:form._id}
        if(verifyVariable(form.code)){ 
          formTemp = {...formTemp,[name + '_code']:form.code} 
        }
        formTemp = {...formTemp,[name + '_text']:text}
        if(typeof this.props.callbackSetForm !== 'undefined'){
          this.props.callbackSetForm({...this.props.data,...formTemp})
        }else if(typeof this.props.callbackChange !== 'undefined'){
          this.props.callbackChange({...formTemp})
        }
      }
    }
  }

  changeSelect = (e) => {
    if(typeof this.props.callbackSetForm !== 'undefined'){
      var id = e.target.name + '_text'
      var text = '';
      Object.values(this.props.content).map(c => {
        if(c.type=='select'){
          if(c.name==e.target.name){
            if(typeof c.data !== 'undefined'){
              Object.values(c.data).map(v => {
                if(v.value==e.target.value){
                  text = v.text
                }
              })
            }
          }
        }
      })
      this.props.callbackSetForm({...this.props.data,[e.target.name]:e.target.value,[id]:text})
    }else if(typeof this.props.callbackChange !== 'undefined'){
      this.props.callbackChange(e)
    }
  }

  click = (e,callback) => {
    var form = this.props.data
    if(e.target.name=="register"){
      if(this.focus.current != null){ 
        this.focus.current.focus() 
      }
      if(this.props.callbackRegister){
        this.props.callbackRegister()
      }
    }else if(e.target.name=="cancel"){
      if(this.props.callbackReset){
        this.props.callbackReset()
      }
    }else if(e.target.name=="save"){
      if(form._id.length==0){
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
    if(typeof callback !== 'undefined'){
      callback()
    }
  }

  desactiveInputGroup = (name) => {
    var formTemp = this.props.data
     
    if(verifyVariable(formTemp[name])){ formTemp[name] = '' }
    if(verifyVariable(formTemp[name + '_code'])){ formTemp[name + '_code'] = '' }
    if(verifyVariable(formTemp[name + '_text'])){ formTemp[name + '_text'] = '' }
      
    if(typeof this.props.callbackSetForm !== 'undefined'){
      this.props.callbackSetForm({...formTemp})
    }else if(typeof this.props.callbackChange !== 'undefined'){
      this.props.callbackChange({...formTemp})
    }
  }

  handleKeyDown = (e,callback) => {
    if(callback){
      callback(e)
    }
  }

  save = (form,forced) => {
    if(typeof forced !== 'undefined'){
      form.forced = true
    }
    if(typeof this.props.notAdjustDecimal === 'undefined'){
      Object.values(this.props.content).map(c => {
        if(c.type=='number'){
          if(typeof c.precision !== 'undefined'){
            if(strlen(form[c.name])>0){
              form[c.name] = parseFloat(form[c.name]).toFixed(c.precision)
            }else{
              form[c.name] = ''
            }
          }
        }
      })
    }
    form._type = 'save'
    if(strlen(form._id)==0 && this.props.idRef){
      form.idRef = this.props.idRef;
    }
    if(this.props.name){
      form._name = this.props.name
    }
    form = sign(form)
    openLoading({count:[1,5,60]})
    api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,form,(res) => {
      if(res.res=="error"){
        if(typeof res.forced === 'undefined'){
          openMsg({text:res.error,type:-1})
        }else{
          openMsg({text:res.error,type:-1,textYes:'Sim',textNo:'Não',callbackYes:() => { closeMsg(),this.save(form,true) }})
        }
      }else{
        if(form._id.length==0){
          if(this.verifyMsgSuccess('c')!=''){
            openMsg({text:(this.verifyMsgSuccess('c') ? this.verifyMsgSuccess('c') : 'Dados cadastrados com sucesso!'),type:1})
          }
        }else{
          if(this.verifyMsgSuccess('u')!=''){
            openMsg({text:(this.verifyMsgSuccess('u') ? this.verifyMsgSuccess('u') : 'Dados alterados com sucesso!'),type:1})
          }
        }

        if(this.props.resetEvery===true){
          if(this.props.callbackReset){
            this.props.callbackReset()
          }
        }else{
          if(this.props.callbackUpdate){
            this.props.callbackUpdate(res.data[0])
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
    var statusA = form.status
    if(type=='d'){
      form.status = 0
      form._type = 'desactive'
    }else if(type=='a'){
      form.status = 1
      form._type = 'active'
    }else if(type=='b'){
      form.status = 2
      form._type = 'block'
    } 
    if(this.props.name){
      form._name = this.props.name
    }
    form = sign(form)
    openLoading({count:[1,5,60]})
    api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,form,(res) => {
      if(res.res=="error"){
        form.status = statusA
        openMsg({text:res.error,type:-1})
      }else{
        if(type=='d'){
          openMsg({text:(this.verifyMsgSuccess('d') ? this.verifyMsgSuccess('d') : 'Dado desativado com sucesso!'),type:1})
        }else if(type=='a'){
          openMsg({text:(this.verifyMsgSuccess('a') ? this.verifyMsgSuccess('a') : 'Dado ativado com sucesso!'),type:1})
        }else if(type=='b'){
          openMsg({text:(this.verifyMsgSuccess('b') ? this.verifyMsgSuccess('b') : 'Dado bloqueado com sucesso!'),type:1})
        }
        
        if(this.props.callbackDab){
          this.props.callbackDab()
        }else if(this.props.resetEvery===true){
          if(this.props.callbackReset){
            this.props.callbackReset()
          }
        }else if(this.props.callbackUpdate){
          this.props.callbackUpdate(res.data[0])
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
            Object.keys(this.props.data).map(k => {
              if(msg.indexOf('@' + k + '#')!=-1){
                msg = msg.replace('@' + k + '#',this.props.data[k])
              }
            })
          }else{
            msg = ''
          }
        }
      } 
    } 
    return msg
  }

  verifyMsgSuccess = (e) => {
    var msg = false
    if(this.props.msg !== undefined){
      if(this.props.msg[e] !== undefined){
        if(this.props.msg[e].success !== undefined){
          if(this.props.msg[e].success.length>0){
            msg = this.props.msg[e].success
          }
        }
      } 
    } 
    return msg
  }

  getData = (k,t,p,v) => {
    if(verifyVariable(v)){
      return v
    }else if(verifyVariable(this.props.data[k])){
      var data = this.props.data
      if(t=='number'){
        if(p !== undefined){
          if(strlen(data[k])>0){
            data[k] = data[k].toString()
            data[k] = data[k].replace(/,/g, '.')
            data[k] = parseFloat(data[k])//.toFixed(p)
          }else{
            data[k] = ''
          }
        }else{
          data[k] = parseFloat(data[k])
        }
      }
      return data[k]
    }else{
      return ''
    }
  }

  step = (p) => {
    if(typeof p === 'undefined'){
      return 1
    }else{
      return "0." + zeroLeft("1",(p))
    }
  }

  prev = () => {
    if(typeof this.props.prev.set !== 'undefined'){
      if(typeof this.props.prev.id !== 'undefined'){
        this.props.prev.set(this.props.prev.id)
      }
    }else if(this.props.callbackPrev){
      if(this.props.prev){
        this.props.callbackPrev(this.props.prev)
      }
    }
  }

  next = () => {
    if(typeof this.props.next.set !== 'undefined'){
      if(typeof this.props.next.id !== 'undefined'){
        this.props.next.set(this.props.next.id)
      }
    }else if(this.props.callbackNext){
      if(this.props.next){
        this.props.callbackNext(this.props.next)
      }
    }
  }

  verifyPrev = () => {
    if(this.props.prev){
      if(typeof this.props.prev.id !== 'undefined'){
        if(this.props.prev.id===false){
          return true
        }else{
          return false
        }
      }else{
        return false
      }
    }else{
      return true
    }
  }

  verifyNext = () => {
    if(this.props.next){
      if(typeof this.props.next.id !== 'undefined'){
        if(this.props.next.id===false){
          return true
        }else{
          return false
        }
      }else{
        return false
      }
    }else{
      return true
    }
  }

  render(){
    return (
      <form autoComplete="off">
        {!this.props.api ? (
          <div>Informe a API</div>
        ):!this.props.content ? (
          <div>Informe o content</div>
        ):!this.props.data ? (
          <div>Informe o data</div>
        ):!this.props.callbackSetForm && !this.props.callbackChange ? (
          <div>Informe o callbackSetForm ou callbackChange</div>
        ):(
          <div>
            <div className={!this.props.withoutMargin ? "form-base form-row" : "form-base withoutMargin form-row"}>
              {(verifyVariable(this.props.slide)===false || this.props.slide === true) &&
                Object.values(this.props.content).map(c => (
                  (c.where ? this.verifyWhere(c.where) : true) ? (  
                    <div key={c.name} className={c.cols + " " + this.props.margin}>

                      {c.label ? (
                        <label>{c.label}</label>
                      ):null}

                      {c.type=='_id' ? (
                        
                        <div className="btn-group special">
                          <button type="button" name="prev" className="btn btn-secondary" disabled={this.verifyPrev()} onClick={() => this.prev()}>{"<"}</button>
                          <button type="button" name={c.name} className="middle btn btn-outline-dark" disabled>{this.getData(c.name,c.type,c.precision,c.value)}</button>
                          <button type="button" name="next" className="btn btn-secondary" disabled={this.verifyNext()} onClick={() => this.next()}>{">"}</button>
                        </div>

                      ):c.type=='status' ? (

                        <div>
                          <div className={"std form-control text-center " + c.className[this.getData(c.name,c.type,c.precision,c.value)]}>{c.mask[this.getData(c.name,c.type,c.precision,c.value)]}</div>
                        </div>

                      ):c.type=='text' ? (
                      
                        <input type="text" ref={c.focus ? this.focus : null} name={c.name} className={"form-control " + c.className} onChange={this.change} value={this.getData(c.name,c.type,c.precision,c.value)} autoFocus={c.focus ? true : false} readOnly={c.readOnly ? true : false} onKeyDown={(e) => this.handleKeyDown(e,c.callback)} disabled={this.props.disabled ? true : false}/>
                      
                      ):c.type=='number' ? (
                      
                        <input type="number" step={this.step(c.precision)} ref={c.focus ? this.focus : null} name={c.name} className={"form-control " + c.className} onChange={this.change} value={this.getData(c.name,c.type,c.precision,c.value)} autoFocus={c.focus ? true : false} readOnly={c.readOnly ? true : false} onKeyDown={(e) => this.handleKeyDown(e,c.callback)} disabled={this.props.disabled ? true : false}/>
                      
                      ):c.type=='textarea' ? (
                      
                        <textarea ref={c.focus ? this.focus : null} name={c.name} className={"form-control " + c.className} rows={c.rows ? c.rows : "5"} onChange={this.change} value={this.getData(c.name,c.type,c.precision,c.value)} readOnly={c.readOnly ? true : false} disabled={this.props.disabled ? true : false}></textarea>
                      
                      ):c.type=='select' ? (

                        <select ref={c.focus ? this.focus : null} name={c.name} className={"form-control " + c.className} onChange={this.changeSelect} value={this.getData(c.name,c.type,c.precision,c.value)} disabled={c.readOnly ? true : this.props.disabled ? true : false}>
                          {typeof c.optionNull !== 'undefined' ? (typeof c.optionNullDisabled !== 'undefined' ? (
                            <option value="" disabled={true} hidden={true}>{ typeof c.optionNull === 'string' ? c.optionNull : '' }</option>
                          ):( 
                            <option value="">{ typeof c.optionNull === 'string' ? c.optionNull : '' }</option>
                          )): null }
                          {typeof c.data !== 'undefined' ? Object.values(c.data).map(v => (
                            <option key={v.value} value={v.value}>{v.text}</option>
                          )) : null}
                        </select>

                      ):c.type=='date' || c.type=='datetime' || c.type=='datetimes' ? (
                                          
                        <input type={c.type=='date' ? 'date' : 'datetime-local'} step={c.type=='date' || c.type=='datetime' ? '' : '1'} ref={c.focus ? this.focus : null} name={c.name} className={"form-control " + c.className} onChange={this.change} value={this.getData(c.name,c.type,c.precision,c.value)} autoFocus={c.focus ? true : false} readOnly={c.readOnly ? true : false} disabled={this.props.disabled ? true : false}/>
                      
                      ):strlower(c.type)=='checkboxgroup' ? (

                        <CheckboxGroup name={c.name} text={verifyVariable(c.text) ? c.text : ''} callbackChange={(e) => { this.change(e),(verifyVariable(c.callback) && c.callback(e)) }} value={this.getData(c.name,c.type,c.precision,c.value)}  disabled={this.props.disabled ? true : false}/>
                      
                      ):strlower(c.type)=='inputgroup' ? (

                        <InputGroup name={c.name} placeholder={verifyVariable(c.placeholder) ? c.placeholder : ''} value={this.getData(c.name + '_text',c.type,c.precision)} collection={verifyVariable(c.collection) ? c.collection : ''} api={verifyVariable(c.api) ? c.api : ''} callbackClickCell={(form) => this.changeInputGroup(c.name,form,(verifyVariable(c.columns) ? c.columns : []))} condition={(verifyVariable(c.condition) ? c.condition : undefined)} callbackDesactive={() => this.desactiveInputGroup(c.name,(verifyVariable(c.columns) ? c.columns : []))}  textarea={verifyVariable(c.textarea) ? c.textarea : false} rows={verifyVariable(c.rows) ? c.rows : false}  disabled={this.props.disabled ? true : false}/>

                      ):c.type=='button' ? (
                        
                        <button type="button" name={c.name} className={"btn " + c.className} onClick={(e) => this.click(e,c.callback)} disabled={this.props.disabled ? (c.name=='cancel' ? false : true) : false}>{c.innerHTML}</button>
                      
                      ):null}
                    </div>
                  ):null
                )
              )}
            </div>
          
            {this.props.button ? (
              <div className={!this.props.withoutMargin ? "form-row" : "form-row withoutMargin"}>
                {Object.values(this.props.button).map(c => (
                  (verifyVariable(c.name) && (
                    (c.where ? this.verifyWhere(c.where) : true) ? ( 
                      (verifyVariable(this.props.slide)===false || this.props.slide === true || c.name=='register') && (
                        <div key={c.name} className={c.cols + " " + this.props.margin}>
                          <button type="button" name={c.name} className={"btn " + c.className} onClick={(e) => this.click(e,c.callback)} disabled={this.props.disabled ? (c.name=='cancel' ? false : true) : false}>{c.innerHTML}</button>
                        </div>
                      )
                    ):null
                  ))
                ))}
              </div>
            ):null}
          </div>
        )}
      </form>
    )
  }
}

export function formUpdate(form,list,callbackSetForm,callbackSetList){
  var listTemp = list
  Object.keys(listTemp).map(k => {
      if(listTemp[k]._id==form._id){
          listTemp[k] = form
      }
  })
  callbackSetForm(form)
  if(callbackSetList){
    callbackSetList(listTemp)
  }
}

export function formModify(id,list,callbackSetForm,callbackSetList,callbackSetNext,callbackSetPrev,slide,callbackSetSlide,title,callbackSetTitle){
  if(callbackSetForm){
    callbackSetForm({_id:'',status:null})
  }
  if(strlen(list)>0){
    if(callbackSetList){
      callbackSetList(list)
    }
  }
  var form = false
  var next = false
  var prev = false
  list.map(d => {
      if(d._id==id){
          form = d
      }else if(form===false){
          prev = d._id
      }else if(next===false){
          next = d._id
      }
  })
  callbackSetForm ? callbackSetForm(form) : null
  callbackSetNext ? callbackSetNext(next) : null
  callbackSetPrev ? callbackSetPrev(prev) : null
  callbackSetSlide ? callbackSetSlide(slide) : null
  callbackSetTitle ? callbackSetTitle(title) : null
}

export function formRegister(slide,callbackSetSlide,form,callbackSetForm,title,callbackSetTitle){
  callbackSetSlide ? callbackSetSlide(slide) : null
  callbackSetForm ? callbackSetForm(form) : null
  callbackSetTitle ? callbackSetTitle(title) : null
}
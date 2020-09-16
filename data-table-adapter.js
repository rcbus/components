/* ########## Definições das propriedades (props): ##########

button: Array de propriedades de botões que serão inseridos na tabela
callbackClickCell: Função de retorno do click em uma célula
callbackRegister: Função de retorno do click do botão cadastrar
callbackSeeAll: Função para conservar o estado do seeAll
collection: A coleção ou tabela do banco de dados
config: Objeto contendo informações de configuração dessa tabela vindo de um banco de dados
data: Dados da tabela. Um objeto contendo pelo menos o campo _id
editable: Quando true permite editar as configurações da tabela
idRef: É o ID de referencia, quando uma informação está ligada a outra informação
margin: É uma classe adicional adicionada na div base do component, essa classe pode 
        ser específica definida em um css ou usando as definições do bootstrap como 
        por exemplo: 

          mt-2 (obs: essa insere uma margem do tipo 2 no topo do objeto)

order: Array com os nomes das colunas na ordem que devem aparecer
seeAll: Serve para o componente pai definir o estado de seeAll conservado
statusGte: Quanto true status é maior ou igual a 1
statusField: define o nome do campo status, caso seja diferente
title: Título da tabela 

########## Definições das propriedades (props): ########## */

import { setCols,setSubState,zeroLeft,strlen,formatDate,formatNumber,setSession,getSession,count } from '../libs/functions'
import { api } from '../libs/api'
import { openLoading, closeLoading } from '../components/loading'
import { openMsg } from '../components/msg';

var cont = -1
var order = []
const nowTemp = new Date();

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name:'',
      formConfig:this.getStdFormConfigState(),
      config:false,
      edit:false,
      seeAll:false,
      list:false,
      search:'',
      loading:false,
      idRef:false,
      update:0,
      statusField:'status'
    };
  }

  componentDidMount(){
    var state = {}
    state.name = this.props.name
    if(this.props.api){
      state.list = []
      if(getSession('config',this.props.collection)){
        state.config = getSession('config',this.props.collection)
      }else{
        state.config = []
      }
    }
    if(this.props.seeAll){
      state.seeAll = this.props.seeAll
    }
    if(getSession('seeAll',this.props.collection)){
      state.seeAll = getSession('seeAll',this.props.collection)
    }
    if(getSession('search',this.props.collection)){
      state.search = getSession('search',this.props.collection)
    }
    if(this.props.idRef){
      state.idRef = this.props.idRef
    }
    if(this.props.statusField){
      state.statusField = this.props.statusField
    }
    this.setState(state,this.getListData)
  }

  componentDidUpdate(){
    if(this.props.idRef){
      if(this.state.idRef!=this.props.idRef){
        this.setState({idRef:this.props.idRef},this.getListData)
      }
    }else if(this.props.data){
      if(this.state.list!=this.props.data){
        this.getListData()
      }
    }else if(this.props.name!=this.state.name){
      if(this.props.statusField){
        this.setState({name:this.props.name,statusField:this.props.statusField},this.getListData)
      }else{
        this.setState({name:this.props.name},this.getListData)
      }
    }
    if(this.props.update){
      if(this.props.update!=this.state.update){
        this.setState({update:this.props.update},this.getListData)
      }
    }else if(this.props.name!=this.state.name){
      this.setState({name:this.props.name},this.getListData)
    }
  }

  changeSearch(e){
    setSession('search',e.target.value,this.props.collection)
    this.setState({search: e.target.value})
  }

  changeSeeAll(){
    setSession('seeAll',!this.state.seeAll,this.props.collection)
    this.setState({seeAll:!this.state.seeAll},this.getListData)
  }

  getListData(condition){
    if(this.props.api){
      var data = {}
      var status = {[this.state.statusField]:1}

      data.condition = {}
      data.config = this.state.config
      data.search = this.state.search

      this.setState({loading:true})

      if(this.props.statusGte){
        status = {[this.state.statusField]:{$gte:1}}
      }
      
      if(typeof condition === 'undefined'){
        if(this.state.seeAll===false){ data.condition = status }
      }else{
        data.condition = condition
      }

      if(this.props.idRef){
        data.condition = {...data.condition,idRef:this.props.idRef}
      }

      if(this.props.callbackSeeAll){
        this.props.callbackSeeAll(this.state.seeAll)
      }

      api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,data,(res) => {
        if(res.res=="error"){
          openMsg({text:res.error,type:-1})
        }else{
          setSession('config',res.data.config,this.props.collection)
          this.setState({
            list:res.data.data,
            config:res.data.config,
            loading:false
          })
        }
      },true)
    }
  }

  getStdFormConfigState(){
    const formConfig = {
      _id:'',
      column:'',
      type:'text',
      mask:'',
      parameter:'',
      className:'',
      width:'',
      align:'left',
      display:'false',
      searchable:'false',
      order:false,
      collection:this.props.collection
    }
    return formConfig
  }

  getRowClass(){
    cont = cont * -1
    if(cont==1){
      return "dtaRowA"
    }else{
      return "dtaRowB"
    }
  }

  onClick = (e) => {
    if(typeof e.target === 'undefined'){
      var config = []

      if(this.state.config!==false){
        config = this.state.config
      }else if(this.props.config){
        this.setState({config:this.props.config})
        config = this.props.config
      }

      var configKey = false
      Object.keys(config).map(k => {
        if(config[k].mask==e){
          configKey = k
        }else if(config[k].column==e){
          configKey = k
        }
      })
      if(configKey===false){
        this.setState({
          formConfig:setSubState(this.getStdFormConfigState(),{column:e,order:(order.length+1),display:'true',searchable:'true'})
        })
      }else{
        this.setState({
          formConfig:setSubState(this.getStdFormConfigState(),config[configKey])
        })
      }
    }else if(e.target.name=='save'){
      openLoading({count:[1,5,60]})   
      api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/api/config',process.env.tokenApi,this.state.formConfig,(res) => {
        if(res.res=="error"){
          openMsg({text:res.error,type:-1})
        }else{
          this.setState({
            config:res.data
          })
          openMsg({text:'Configuração salva com sucesso!',type:1})
        }  
        closeLoading()
      },true)
    }else if(e.target.name=='cancel'){
      this.setState({
        formConfig:this.getStdFormConfigState()
      })
    }else if(e.target.name=='edit'){
      this.setState({edit:!this.state.edit})
    }
  }

  onChangeFormConfig = (e) => {
    this.setState({
      formConfig:setSubState(this.state.formConfig,{[e.target.name]: e.target.value})
    });
  }

  onClickCell = (e,callback) => {
    if(this.props.callbackClickCell !== undefined && callback === undefined){
      this.props.callbackClickCell(e,this.state.list)
    }
    if(callback !== undefined){
      callback(e,this.state.list)
    }
  }

  preRender = (warning,edit) => {
    return (
      <div className={this.props.margin}>
        <div className="form-row">
          <div className={setCols(12,12,12,12,12)}>
            <table className="table table-bordered mt-2">
              <thead>
                <tr className="dtaTop">
                  <th scope="col">
                    <div className="form-row mb-0">
                      <div align="left" className={setCols(6,6,6,6,6)}>
                        {warning}
                      </div>
                      {edit ? (
                        <div align="right" className={setCols(6,6,6,6,6)}>
                          <button type="button" name="edit" className={this.state.edit==false ? "btn btn-sm btn-secundary" : "btn btn-sm btn-warning"} onClick={this.onClick}>{this.state.edit==false ? "Editar" : "Fechar Edição"}</button>
                        </div>
                      ):null}
                    </div>
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </div>
    )
  }

  render(){
    cont = -1
    if(typeof this.props.collection === 'undefined'){
      return this.preRender("Informe a collection")
    }else if(typeof this.props.data === 'undefined' && this.state.list===false){
      return this.preRender("Informe o data ou a api")
    }else if(typeof this.props.config === 'undefined' && this.state.config===false){
      return this.preRender("Informe o config")
    }else if(this.props.data==null && this.state.list===false){
      return this.preRender("Carregando...")
    }else{      
      var configTemp = []
      var config = []
      var mask = []
      var type = []
      var parameter = {}
      var className = []
      var width = []
      var align = []
      var display = []
      var searchable = []
      var countColumns = 0
      var data = []
      var innerHTML = []
      var name = []
      var callback = []

      order = []

      if(this.state.config!==false){
        configTemp = this.state.config
      }else if(this.props.config){
        configTemp = this.props.config
      }

      Object.keys(configTemp).map(k => {
        config[configTemp[k].column] = {
          type:configTemp[k].type,
          mask:configTemp[k].mask,
          parameter:configTemp[k].parameter,
          className:configTemp[k].className,
          width:configTemp[k].width,
          align:configTemp[k].align,
          display:configTemp[k].display,
          searchable:configTemp[k].searchable,
          order:configTemp[k].order,
          collection:configTemp[k].collection
        }
      })

      if(this.state.list!==false){
        data = this.state.list
      }else if(this.props.data){
        data = this.props.data
      }

      Object.values(data).map(v => {
        Object.keys(v).map(k => {
          if(typeof mask[k] === 'undefined'){
            mask[k] = k
            type[k] = 'text'
            parameter[k] = {}
            className[k] = []
            width[k] = []
            align[k] = 'left'
            display[k] = 'false'
            searchable[k] = 'false'

            if(typeof config[k] !== 'undefined'){
              if(config[k].mask.length>0){
                mask[k] = config[k].mask  
              }
              if(config[k].parameter.length>0){
                if(config[k].parameter.indexOf('#')==-1){
                  parameter[k][0] = config[k].parameter  
                }else{  
                  var parameterTemp = config[k].parameter.split(',')  
                  Object.values(parameterTemp).map(v => {
                    if(typeof parameter[k] === 'undefined'){ parameter[k] = {} }
                    parameter[k][v.substr(0,v.indexOf("#"))] = v.substr(v.indexOf("#")+1)
                  })
                }
              }
              if(config[k].className.length>0){
                if(config[k].className.indexOf('#')==-1){
                  className[k][0] = config[k].className  
                }else{
                  var classNameTemp = config[k].className.split(',')  
                  Object.values(classNameTemp).map(v => {
                    if(typeof className[k] === 'undefined'){ className[k] = [] }
                    className[k][v.substr(0,v.indexOf("#"))] = v.substr(v.indexOf("#")+1)
                  })
                }
              }
              width[k] = config[k].width
              type[k] = config[k].type
              align[k] = config[k].align
              display[k] = config[k].display
              searchable[k] = config[k].searchable
              order.push(zeroLeft(config[k].order,5) + "#" + k)
            }
            if(display[k]=='true' || this.state.edit==true){
              countColumns = countColumns + 1
            }
          }
        })
      })

      function renderButtonTitle(button,key){
        if(count(button)){
          countA = countA + 1
          button.map(b => {
            if(b.order==countA){
              display[key + b.name] = "true"
              align[key + b.name] = b.align
              type[key + b.name] = b.type
              name[key + b.name] = b.name
              innerHTML[key + b.name] = b.innerHTML
              maskOrder[key + b.name] = b.label
              callback[key + b.name] = b.callback

              if(typeof b.className === 'string' ){
                className[key + b.name] = b.className
              }else if(b.classNameWhere === undefined){
                className[key + b.name] = b.className[0]
              }else{
                data.map(data => {
                  var classNameTemp = false
                  b.classNameWhere.map(classNameWhere => {
                    if(data[classNameWhere.where] !== undefined){
                      if(classNameWhere.operator === undefined){
                        if(data[classNameWhere.where]==classNameWhere.value){
                          if(classNameWhere.classNumber === undefined){
                            classNameTemp = 0
                          }else{
                            classNameTemp = classNameWhere.classNumber
                          }
                        }
                      }else if(classNameWhere.operator == 'like'){
                        if(data[classNameWhere.where].indexOf(classNameWhere.value)!=-1){
                          if(classNameWhere.classNumber === undefined){
                            classNameTemp = 0
                          }else{
                            classNameTemp = classNameWhere.classNumber
                          }
                        }
                      }
                    }
                  })
                  if(classNameTemp===false){
                    className[key + b.name + data._id] = b.className[0]
                  }else{
                    className[key + b.name + data._id] = b.className[classNameTemp]
                  }
                })
              }
            }
          })
        }
      }

      var countA = 0
      var maskOrder = []
      if(this.props.order){
        countA = 0
        Object.values(this.props.order).map(v => {
          if(typeof mask[v] !== 'undefined'){
            renderButtonTitle(this.props.button,v)
            maskOrder[v] = mask[v]
          }
        })
        Object.keys(mask).map(k => {
          if(typeof maskOrder[k] === 'undefined'){
            renderButtonTitle(this.props.button,k)
            maskOrder[k] = mask[k]
          }
        })
      }else if(order.length>0){
        order.sort()
        Object.values(order).map(v => {
          var vTemp = v.substr(v.indexOf("#")+1)
          if(typeof mask[vTemp] !== 'undefined'){
            renderButtonTitle(this.props.button,vTemp)
            maskOrder[vTemp] = mask[vTemp]
          }
        })
        Object.keys(mask).map(k => {
          if(typeof maskOrder[k] === 'undefined'){
            renderButtonTitle(this.props.button,k)
            maskOrder[k] = mask[k]
          }
        })
      }else{
        maskOrder = mask
      }

      return (
        <>
          {this.props.search ? (
            <div className={this.props.margin + " form-row"}>
              <div className={setCols(
                12,
                12,
                ((this.props.withoutSeeAll !== undefined && 3) + (this.props.withoutRegister !== undefined && 3) + (this.props.withCancel === undefined && 3) + 3),
                ((this.props.withoutSeeAll !== undefined && 2) + (this.props.withoutRegister !== undefined && 2) + (this.props.withCancel === undefined && 2) + 6),
                ((this.props.withoutSeeAll !== undefined && 2) + (this.props.withoutRegister !== undefined && 2) + (this.props.withCancel === undefined && 2) + 6)
                ) + " mb-2 mb-md-0 "}>
                <input type="text" className="form-control" value={this.state.search} onChange={(e) => this.changeSearch(e)} onKeyDown={(e) => (e.key=="Enter" ? this.getListData() : null)} placeholder="Pesquise Aqui"/>
              </div>
              {this.props.withoutSeeAll === undefined && (
                <div className={setCols(12,4,3,2,2,1)}>
                  <button type="button" className={"btn " + (!this.state.seeAll ? "btn-secondary" : "btn-warning") + " btn-block"} onClick={() => this.changeSeeAll()}>{!this.state.seeAll ? "Ver Todos" : "Não Ver Todos"}</button>
                </div>
              )}
              {this.props.withoutRegister === undefined && (
                <div className={setCols(12,4,3,2,2,1)}>
                  <button type="button" className="btn btn-primary btn-block" onClick={() => (this.props.callbackRegister ? this.props.callbackRegister() : null)}>+ Cadastrar</button>
                </div>
              )}
              {this.props.withCancel !== undefined && (
                <div className={setCols(12,4,3,2,2,1)}>
                  <button type="button" className="btn btn-warning btn-block" onClick={() => (this.props.callbackCancel ? this.props.callbackCancel() : null)}>Cancelar</button>
                </div>
              )}
            </div>
          ):null}
          <div className={this.props.margin}>
            {this.state.edit===true ? (
              <div className="form-row" id="baseConfig" name="baseConfig">
                <div className={setCols(12,12,4,3,2)}>
                  <label>Column</label>
                  <input type="text" className="form-control" name="column" value={this.state.formConfig.column} readOnly />
                </div>
                <div className={setCols(12,8,4,3,3)}>
                  <label>Mask</label>
                  <input type="text" className="form-control" name="mask" value={this.state.formConfig.mask} onChange={this.onChangeFormConfig}/>
                </div>
                <div className={setCols(12,4,4,2,2)}>
                  <label>Type</label>
                  <select className="form-control" name="type" value={this.state.formConfig.type} onChange={this.onChangeFormConfig}>
                    <option>text</option>
                    <option>date</option>
                    <option>date abb 1</option>
                    <option>number</option>
                  </select>
                </div>
                <div className={setCols(6,3,3,2,1)}>
                  <label>Align</label>
                  <select className="form-control" name="align" value={this.state.formConfig.align} onChange={this.onChangeFormConfig}>
                    <option>left</option>
                    <option>center</option>
                    <option>right</option>
                  </select>
                </div>
                <div className={setCols(6,3,3,2,1)}>
                  <label>Display</label>
                  <select className="form-control" name="display" value={this.state.formConfig.display} onChange={this.onChangeFormConfig}>
                    <option>true</option>
                    <option>false</option>
                  </select>
                </div>
                <div className={setCols(6,4,3,2,2)}>
                  <label>Searchable</label>
                  <select className="form-control" name="searchable" value={this.state.formConfig.searchable} onChange={this.onChangeFormConfig}>
                    <option>true</option>
                    <option>false</option>
                  </select>
                </div>
                <div className={setCols(6,2,3,2,1)}>
                  <label>Order</label>
                  <input type="text" className="form-control" name="order" value={this.state.formConfig.order===false ? (order.length + 1) : this.state.formConfig.order} onChange={this.onChangeFormConfig}/>
                </div>
                <div className={setCols(12,12,6,3,3)}>
                  <label>Parameter</label>
                  <input type="text" className="form-control" name="parameter" value={this.state.formConfig.parameter} onChange={this.onChangeFormConfig}/>
                </div>
                <div className={setCols(12,12,6,3,3)}>
                  <label>Class</label>
                  <input type="text" className="form-control" name="className" value={this.state.formConfig.className} onChange={this.onChangeFormConfig}/>
                </div>
                <div className={setCols(12,12,6,2,2)}>
                  <label>Width</label>
                  <input type="text" className="form-control" name="width" value={this.state.formConfig.width} onChange={this.onChangeFormConfig}/>
                </div>
                <div className={setCols(6,6,3,2,2)}>
                  <label></label>
                  <button type="button" name="save" className="btn btn-success btn-block" onClick={this.onClick}>Salvar</button>
                </div>
                <div className={setCols(6,6,3,2,2)}>
                  <label></label>
                  <button type="button" name="cancel" className="btn btn-warning btn-block" onClick={this.onClick}>Cancelar</button>
                </div>
              </div>
            ):null}
            <div className="form-row withoutMargin">
              <div className={setCols(12,12,12,12,12) + " divScrollX"}>
                <table className="table table-bordered mt-2">
                  
                  {(!this.props.withoutTitle || this.props.editable) ? (
                    <thead>
                      <tr className="dtaTop">
                        <th scope="col" colSpan={countColumns + count(this.props.button)}>
                          <div className="form-row mb-0">
                            <div align="left" className={setCols(6,6,6,6,6)}>
                              {this.state.loading===true ? (
                                "Carregando..."
                              ):(
                                (this.props.title ? this.props.title : '') + ' ' + (data.length ? '(' + data.length + ')' : '(0)')
                              )}
                            </div>
                            {this.props.editable==true ? (
                              <div align="right" className={setCols(6,6,6,6,6)}>
                                <button type="button" name="edit" className={this.state.edit==false ? "btn btn-sm btn-secundary" : "btn btn-sm btn-warning"} onClick={this.onClick}>{this.state.edit==false ? "Editar" : "Fechar Edição"}</button>
                              </div>
                            ):null}
                          </div>
                        </th>
                      </tr>
                    </thead>
                  ):null}

                  <thead>
                    <tr className="dtaTop">
                      {Object.keys(maskOrder).map(k => (
                        (display[k]=="true" || this.state.edit==true) ? (
                          <th key={k} scope="col" className={display[k]=="true" ? "" : "stdRed"} onClick={() => this.onClick(maskOrder[k])}>
                            <div align={align[k]} width={strlen(width[k]) ? width[k] : ''}>
                              {maskOrder[k]}
                            </div>
                          </th>
                        ):null
                      ))}
                    </tr>
                  </thead>
                  {data.map(data => (
                    <tbody key={data._id}>
                      <tr className={this.getRowClass()}>
                        {Object.keys(maskOrder).map(k => (
                          (display[k]=="true" || this.state.edit==true) ? (
                            (k == 'id' || k=='_id') ? (
                              <th key={k} scope="row" name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                <div align={align[k]} style={strlen(width[k]) ? {width:`${width[k]}px`} : {}}>
                                  {data[k]}
                                </div>
                              </th>
                            ):(
                              (type[k]=='text' && count(parameter[k])>0) ? (
                                <td key={k} className={typeof className[k] !== 'undefined' ? typeof className[k][data[k]] !== 'undefined' ? className[k][data[k]] : typeof className[k][0] !== 'undefined' ? className[k][0] : null : null} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                  <div align={align[k]} style={strlen(width[k]) ? {width:`${width[k]}px`} : {}}>
                                    {typeof parameter[k] !== 'undefined' ? typeof parameter[k][data[k]] !== 'undefined' ? parameter[k][data[k]] : typeof parameter[k][0] !== 'undefined' ? parameter[k][0] : null : null}
                                  </div>
                                </td>
                              ):(
                                (type[k]=='date' || type[k]=='date abb 1') ? ( 
                                  <td key={k} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                    <div align={align[k]} style={strlen(width[k]) ? {width:`${width[k]}px`} : {}}>
                                      {formatDate(data[k],type[k])}
                                    </div>
                                  </td>
                                ):(
                                  (type[k]=='number') ? ( 
                                    <td key={k} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                      <div align={align[k]} style={strlen(width[k]) ? {width:`${width[k]}px`} : {}}>
                                        {formatNumber(data[k])}
                                      </div>
                                    </td>
                                  ):(
                                    (type[k]=='button') ? ( 
                                      <td key={k} name={data['_id'] + '#' + k}>
                                        <div align={align[k]} style={strlen(width[k]) ? {width:`${width[k]}px`} : {}}>
                                          <button type="button" name={name[k]} className={"btn " + (className[k + data['_id']] === undefined ? className[k] : className[k + data['_id']])} onClick={() => this.onClickCell(data['_id'],callback[k])}>{innerHTML[k]}</button>
                                        </div>
                                      </td>
                                    ):(
                                      <td key={k} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                        <div align={align[k]} style={strlen(width[k]) ? {width:`${width[k]}px`} : {}}>
                                          {data[k]}
                                        </div>
                                      </td>
                                    )
                                  )
                                )
                              )
                            )
                          ):null
                        ))}
                      </tr>
                    </tbody>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </>
      )
    }
  }
}
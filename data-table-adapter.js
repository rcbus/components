/* ########## Definições das propriedades (props): ##########

callbackClickCell: Função de retorno do click em uma célula
callbackRegister: Função de retorno do click do botão cadastrar
callbackSeeAll: Função para conservar o estado do seeAll
collection: A coleção ou tabela do banco de dados
config: Objeto contendo informações de configuração dessa tabela vindo de um banco de dados
data: Dados da tabela. Um objeto contendo pelo menos o campo _id
editable: Quando true permite editar as configurações da tabela
margin: É uma classe adicional adicionada na div base do component, essa classe pode 
        ser específica definida em um css ou usando as definições do bootstrap como 
        por exemplo: 

          mt-2 (obs: essa insere uma margem do tipo 2 no topo do objeto)

order: Array com os nomes das colunas na ordem que devem aparecer
seeAll: Serve para o componente pai definir o estado de seeAll conservado
title: Título da tabela 

########## Definições das propriedades (props): ########## */

import { setCols,setSubState,zeroLeft,strlen,formatDate } from '../libs/functions'
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
      formConfig:this.getStdFormConfigState(),
      config:false,
      edit:false,
      seeAll:false,
      list:false,
      search:'',
      loading:false
    };
  }

  componentDidMount(){
    var state = {}
    if(this.props.api){
      state.list = []
      state.config = []
    }
    if(this.props.seeAll){
      state.seeAll = this.props.seeAll
    }
    this.setState(state,this.getListData)
  }

  getListData(condition){
    if(this.props.api){
      var data = {}
      data.condition = {}
      data.config = this.state.config
      data.search = this.state.search

      this.setState({loading:true})
      
      if(typeof condition === 'undefined'){
        if(this.state.seeAll===false){ data.condition = {status:1} }
      }else{
        data.condition = condition
      }

      if(this.props.callbackSeeAll){
        this.props.callbackSeeAll(this.state.seeAll)
      }

      api(process.env.protocolApi + '://' + process.env.hostApi + ':' + process.env.portApi + '/' + this.props.api,process.env.tokenApi,data,(res) => {
        if(res.res=="error"){
          openMsg({text:res.error,type:-1})
        }else{
          this.setState({
            list:res.data.data,
            config:res.data.config,
            loading:false
          })
        }
      })
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
      })
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

  onClickCell = (e) => {
    if(typeof this.props.callbackClickCell !== 'undefined'){
      this.props.callbackClickCell(e,this.state.list)
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
      var parameter = []
      var className = []
      var align = []
      var display = []
      var searchable = []
      var countColumns = 0
      var data = []

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
            parameter[k] = []
            className[k] = []
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
                    if(typeof parameter[k] === 'undefined'){ parameter[k] = [] }
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

      var maskOrder = []
      if(this.props.order){
        Object.values(this.props.order).map(v => {
          if(typeof mask[v] !== 'undefined'){
            maskOrder[v] = mask[v]
          }
        })
        Object.keys(mask).map(k => {
          if(typeof maskOrder[k] === 'undefined'){
            maskOrder[k] = mask[k]
          }
        })
      }else if(order.length>0){
        order.sort()
        Object.values(order).map(v => {
          var vTemp = v.substr(v.indexOf("#")+1)
          if(typeof mask[vTemp] !== 'undefined'){
            maskOrder[vTemp] = mask[vTemp]
          }
        })
        Object.keys(mask).map(k => {
          if(typeof maskOrder[k] === 'undefined'){
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
              <div className={setCols(12,12,6,8,8) + " mb-2 mb-md-0 "}>
                <input type="text" className="form-control" value={this.state.search} onChange={(e) => this.setState({search: e.target.value})} onKeyDown={(e) => (e.key=="Enter" ? this.getListData() : null)} placeholder="Pesquise Aqui"/>
              </div>
              <div className={setCols(12,6,3,2,2,1)}>
                <button type="button" className={"btn " + (!this.state.seeAll ? "btn-secondary" : "btn-warning") + " btn-block"} onClick={() => this.setState({seeAll:!this.state.seeAll},this.getListData)}>{!this.state.seeAll ? "Ver Todos" : "Não Ver Todos"}</button>
              </div>
              <div className={setCols(12,6,3,2,2,1)}>
                <button type="button" className="btn btn-primary btn-block" onClick={() => (this.props.callbackRegister ? this.props.callbackRegister() : null)}>+ Cadastrar</button>
              </div>
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
                <div className={setCols(12,12,6,4,4)}>
                  <label>Parameter</label>
                  <input type="text" className="form-control" name="parameter" value={this.state.formConfig.parameter} onChange={this.onChangeFormConfig}/>
                </div>
                <div className={setCols(12,12,6,4,4)}>
                  <label>Class</label>
                  <input type="text" className="form-control" name="className" value={this.state.formConfig.className} onChange={this.onChangeFormConfig}/>
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
            <div className="form-row">
              <div className={setCols(12,12,12,12,12) + " divScrollX"}>
                <table className="table table-bordered mt-2">
                  
                  {(!this.props.withoutTitle || this.props.editable) ? (
                    <thead>
                      <tr className="dtaTop">
                        <th scope="col" colSpan={countColumns}>
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
                            <div align={align[k]}>
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
                                <div align={align[k]}>
                                  {data[k]}
                                </div>
                              </th>
                            ):(
                              (type[k]=='text' && parameter[k].length>0) ? (
                                <td key={k} className={typeof className[k] !== 'undefined' ? typeof className[k][data[k]] !== 'undefined' ? className[k][data[k]] : typeof className[k][0] !== 'undefined' ? className[k][0] : null : null} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                  <div align={align[k]}>
                                    {typeof parameter[k] !== 'undefined' ? typeof parameter[k][data[k]] !== 'undefined' ? parameter[k][data[k]] : typeof parameter[k][0] !== 'undefined' ? parameter[k][0] : null : null}
                                  </div>
                                </td>
                              ):(
                                (type[k]=='date' || type[k]=='date abb 1') ? ( 
                                  <td key={k} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                    <div align={align[k]}>
                                      {formatDate(data[k],type[k])}
                                    </div>
                                  </td>
                                ):(
                                  <td key={k} name={data['_id'] + '#' + k} onClick={() => this.onClickCell(data['_id'])}>
                                    <div align={align[k]}>
                                      {data[k]}
                                    </div>
                                  </td>
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
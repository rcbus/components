import { setCols,setSubState } from '../libs/functions'
import { api } from '../libs/api'
import { openLoading, closeLoading } from '../components/loading'
import { openMsg } from '../components/msg';

var cont = -1

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formConfig:this.getStdFormConfigState(),
      config:[],
      edit:false
    };
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
      display:'true',
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
    if(typeof e.target.name === 'undefined'){
      var config = []
      if(this.state.config.length==0){
        this.setState({config:this.props.config})
        config = this.props.config
      }else{
        config = this.state.config
      }
      var configKey = false
      Object.keys(config).map(k => {
        if(config[k].mask==e.target.innerHTML){
          configKey = k
        }else if(config[k].column==e.target.innerHTML){
          configKey = k
        }
      })
      if(configKey===false){
        this.setState({
          formConfig:setSubState(this.getStdFormConfigState(),{column:e.target.innerHTML})
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

  render(){
    cont = -1
    if(typeof this.props.collection === 'undefined'){
      return (
        <div>
          <div className="form-row">
            <div className={setCols(12,12,12,12,12)}>
              <table className="table table-bordered">
                <thead>
                  <tr className="dtaTop">
                    <th scope="col">
                      <div align="center">
                        Informe a collection
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      )
    }else if(this.props.data.length==0){
      return (
        <div>
          <div className="form-row">
            <div className={setCols(12,12,12,12,12)}>
              <table className="table table-bordered">
                <thead>
                  <tr className="dtaTop">
                    <th scope="col">
                      <div align="center">
                        {this.props.title} - Nenhum Dado Carregado
                      </div>
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        </div>
      )
    }else{
      var configTemp = []
      var config = []
      var mask = []
      var type = []
      var parameter = []
      var className = []
      var align = []
      var display = []
      var countColumns = 0;

      if(this.state.config.length==0){
        configTemp = this.props.config
      }else{
        configTemp = this.state.config
      }

      Object.keys(configTemp).map(k => {
        config[configTemp[k].column] = {
          type:configTemp[k].type,
          mask:configTemp[k].mask,
          parameter:configTemp[k].parameter,
          className:configTemp[k].className,
          align:configTemp[k].align,
          display:configTemp[k].display,
          collection:configTemp[k].collection
        }
      })

      Object.keys(this.props.data[0]).map(k => {
        mask[k] = k
        type[k] = 'text'
        parameter[k] = []
        className[k] = []
        align[k] = 'left'
        display[k] = 'true'
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
        }
        if(display[k]=='true' || this.state.edit==true){
          countColumns = countColumns + 1
        }
      })

      return (
        <div>
          {this.state.edit==true ? (
            <div className="form-row" id="baseConfig" name="baseConfig">
              <div className={setCols(12,12,4,3,3)}>
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
                  <option>number</option>
                </select>
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
                <label>Align</label>
                <select className="form-control" name="align" value={this.state.formConfig.align} onChange={this.onChangeFormConfig}>
                  <option>left</option>
                  <option>center</option>
                  <option>right</option>
                </select>
              </div>
              <div className={setCols(6,6,3,2,2)}>
                <label>Display</label>
                <select className="form-control" name="display" value={this.state.formConfig.display} onChange={this.onChangeFormConfig}>
                  <option>true</option>
                  <option>false</option>
                </select>
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
              <table className="table table-bordered">
                <thead>
                  <tr className="dtaTop">
                    <th scope="col" colSpan={countColumns}>
                      <div className="form-row mb-0">
                        <div align="left" className={setCols(6,6,6,6,6)}>
                          {this.props.title} ({this.props.data.length})
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
                <thead>
                  <tr className="dtaTop">
                    {Object.keys(mask).map(k => (
                      (display[k]=="true" || this.state.edit==true) ? (
                        <th key={k} scope="col" className={display[k]=="true" ? "" : "stdRed"}>
                          <div align={align[k]} onClick={this.onClick}>
                            {mask[k]}
                          </div>
                        </th>
                      ):null
                    ))}
                  </tr>
                </thead>
                {this.props.data.map(data => (
                  <tbody key={data._id}>
                    <tr className={this.getRowClass()}>
                      {Object.keys(data).map(k => (
                        (display[k]=="true" || this.state.edit==true) ? (
                          (k == 'id' || k=='_id') ? (
                            <th key={k} scope="row">
                              <div name={data['_id'] + '#' + k} align={align[k]} onClick={this.props.callbackOnClickCell}>
                                {data[k]}
                              </div>
                            </th>
                          ):(
                            (type[k]=='text' && parameter[k].length>0) ? (
                              <td key={k} className={typeof className[k] !== 'undefined' ? typeof className[k][data[k]] !== 'undefined' ? className[k][data[k]] : typeof className[k][0] !== 'undefined' ? className[k][0] : null : null}>
                                <div name={data['_id'] + '#' + k} align={align[k]} onClick={this.props.callbackOnClickCell}>
                                  {typeof parameter[k] !== 'undefined' ? typeof parameter[k][data[k]] !== 'undefined' ? parameter[k][data[k]] : typeof parameter[k][0] !== 'undefined' ? parameter[k][0] : null : null}
                                </div>
                              </td>
                            ):(
                              <td key={k}>
                                <div name={data['_id'] + '#' + k} align={align[k]} onClick={this.props.callbackOnClickCell}>
                                  {data[k]}
                                </div>
                              </td>
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
      )
    }
  }
}
import Head from 'next/head'
import Version from '../version-app'
import Loading from './loading'
import Msg, { openMsg } from './msg'
import { setCols,setSubState,setSession,getSession,unSetSession,count } from '../libs/functions'
import Router from 'next/router'
import { api,getHostApi,getTokenApi } from '../libs/api'

const now = new Date();

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.user = React.createRef();
    this.pass = React.createRef();
  }

  componentDidMount(){
    this.user.current.focus();
  }

  onClickFormLogin = (e) => {
    if(e.target.name=="login"){
      var data = {}
      data.user = this.user.current.value
      data.pass = this.pass.current.value
      api(getHostApi() + 'api/login',getTokenApi(),data,(res) => {
        if(res.error){
          openMsg({text:res.error,type:-1})
        }else{
          const user = {
            token:res.data[0].token,
            branch:res.data[0].branch,
            access:res.data[0].access,
            user:res.data[0].user,
            userName:res.data[0].userName,
            userFullName:res.data[0].userFullName,
            userCpfCnpj:res.data[0].cpfCnpj,
            type:res.data[0].type,
            branchSelected:(count(res.data[0].branch)>1 ? -1: 0)
          }
          console.log(user)
          if(setSession("userData",user)){
            unSetSession("menu","home")
            Router.push('/')
          }
        }
      })
    }
  }

  render(){
    return (
      <div>
        <div className="layout-login-background">
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta
              name="description"
              content={this.props.description ? this.props.description : "Layout Login Component"}
            />
            <title>{this.props.title ? this.props.title : "Layout Login Component"}</title>
          </Head>
          <Loading></Loading>
          <Msg></Msg>
          <div className="layout-login-base">  
            <div className="layout-login-item layout-login-space-m">
              <div className="w-100 d-flex justify-content-center layout-login-space-m-child-a">
                <div className={setCols(12,9,6,4,3) + "container layout-login-super-card"}>
                  <form autoComplete="off">
                    <div className={setCols(12,12,12,12,12)}>
                      <div className="d-flex justify-content-center">
                        <img className="favicon" src="favicon.png" />
                      </div>
                      <style jsx>{`
                        .favicon{
                          border-radius:15px;
                          margin-bottom:25px;
                          border:2px;
                          border-style:solid;
                          border-color:rgb(180,180,180);
                          box-shadow: 0px 0px 10px;
                        }
                      `}</style>
                      <div className="w-100 text-center">
                        <h4>Seja Bem Vindo!</h4>
                      </div>
                    </div>
                    <div className={setCols(12,12,12,12,12)}>
                      <label>Usuário</label>
                      <input type="text" ref={this.user} className="form-control text-center" />
                    </div>
                    <div className={setCols(12,12,12,12,12)}>
                      <label>Senha</label>
                      <input type="password" ref={this.pass} name="pass" className="form-control text-center" />
                    </div>
                    <div className={setCols(12,12,12,12,12)}>
                      <label></label>
                      <button type="button" name="login" className="btn btn-lg btn-primary btn-block" onClick={this.onClickFormLogin}>Entrar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="layout-login-item layout-login-space-f d-flex align-items-center">
              <div className="text-center">
                {this.props.appName ? this.props.appName : "Layout Component"} © {now.getFullYear()}<br/>Todos os Direitos Reservados <Version/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
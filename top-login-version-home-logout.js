import Router from 'next/router'
import { setCols,getSession,unSetSession } from '../libs/functions'
import Version from '../version-app'

export default function Top({className}){
    function home(){
        Router.push('/')
    }

    function logout(){
        unSetSession("userData")
        Router.push('/login')
    }

    function keyPress(e){
        
    }

    return(
        <div className={className + " top-login-version-home-logout"} onKeyPress={keyPress} onKeyDown={keyPress}>
            <div name="header" className={setCols(12,6,8,8,10) + " text-right"}>
                <b>{getSession("userData").userName + " @ " + getSession("userData").branchName} <Version align="right"/></b>
            </div>
            <div className={setCols(6,3,2,2,1)}>
                <button type="button" name="home" className="btn btn-success btn-block" onClick={home}>Home</button>
            </div>
            <div className={setCols(6,3,2,2,1)}>
                <button type="button" name="logout" className="btn btn-danger btn-block" onClick={logout}>Sair</button>
            </div>
        </div>
    )
}
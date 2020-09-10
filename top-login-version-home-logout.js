import Router from 'next/router'
import { useState,useEffect } from 'react'
import { setCols,getSession,unSetSession,setSession,verifyVariable } from '../libs/functions'
import Version from '../version-app'

export default function Top({className,callbackSelectBranch}){
    const [slide,setSlide] = useState(false)
    const [branch,setBranch] = useState(0)
    const [branchList,setBranchList] = useState([])
    const [loginInfo,setLoginInfo] = useState('')

    useEffect(() => {
        getSession("userData",undefined,true,(userData) => {
            if(userData){
                setBranch(userData.branchSelected)
                setBranchList(userData.branch)
            }
        })
    },[])

    useEffect(() => {
        var loginInfoTemp = ''
        getSession("userData",undefined,true,(userData) => {
            if(verifyVariable(userData)){
                if(verifyVariable(userData.userName)){
                    loginInfoTemp += userData.userName
                }
                if(verifyVariable(userData.branch)){
                    if(verifyVariable(userData.branch[userData.branchSelected])){
                        loginInfoTemp += ' @ ' + userData.branch[userData.branchSelected].name
                    }
                }
            }
            setLoginInfo(loginInfoTemp)
        })
    },[slide])

    function home(){
        Router.push('/')
    }

    function logout(){
        unSetSession("userData",undefined,true,(userData) => {
            unSetSession("userData")
            Router.push('/login')
        })
    }

    function keyPress(e){
        
    }

    function selectBranch(){
        getSession("userData",undefined,true,(userData) => {
            if(userData){
                userData.branchSelected = branch
                if(setSession("userData",userData)){
                    setSession("userData",userData,undefined,undefined,true,(userData) => {
                        if(userData){
                            setSlide(false)
                            if(callbackSelectBranch){
                                callbackSelectBranch()
                            }
                        }
                    })
                }
            }
        })
    }

    return(
        <div className={className + " top-login-version-home-logout"} onKeyPress={keyPress} onKeyDown={keyPress}>
            {!slide ? (
                <div id="baseInfo" name="baseInfo" className={"form-row withoutMargin w-100"}>
                    <div id="loginInfo" name="loginInfo" className={setCols(12,8,8,8,10) + " text-left"} onClick={() => setSlide(true)}>
                        <b>{loginInfo}<Version align="right"/></b>
                    </div>
                    <div id="buttonsInfo" name="buttonsInfo" className={setCols(12,4,4,4,2) + ' form-row'}>
                        <div className={setCols(6,6,6,6,6)}>
                            <button type="button" name="home" className="btn btn-success btn-block" onClick={home}>Home</button>
                        </div>
                        <div className={setCols(6,6,6,6,6)}>
                            <button type="button" name="logout" className="btn btn-danger btn-block" onClick={logout}>Sair</button>
                        </div>
                    </div>
                    <style jsx>{`
                        #baseInfo{
                            margin:0px;
                            padding:0px;
                        }
                        #loginInfo{
                            margin:0px;
                            margin-top:12px;
                        }
                        #buttonsInfo{
                            margin:0px;
                            padding:0px;
                            margin-top:13px;
                            margin-bottom:13px;
                        }
                    `}</style>
                </div>
            ):(
                <div className={"form-row withoutMargin w-100"}>
                    <div className={setCols(12,12,12,12,12) + ' form-row'}>
                        <div className={setCols(12,12,6,6,8)}>
                            <label><b>SELECIONE UMA FILIAL</b></label>
                            <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                <option key={-1} value={''}>{''}</option>
                                {branchList.map((b,k) => (
                                    <option key={k} value={k}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={setCols(12,6,3,3,2)}>
                            <label> </label>
                            <button type="button" className="btn btn-success btn-block" onClick={() => selectBranch()}>Selecionar</button>
                        </div>
                        <div className={setCols(12,6,3,3,2)}>
                            <label> </label>
                            <button type="button" className="btn btn-warning btn-block" onClick={() => setSlide(false)}>Voltar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
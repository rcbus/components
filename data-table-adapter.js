var cont = -1

export default function Dta({ data }) {
  var align = [];
  var fake = [];

  function getConfig(item){
    if(item.type=="align"){
    	align = item
    }else if(item.type=="fake"){
      fake = item
    }
  }

  if(typeof data.error === 'undefined'){
    data.map(getConfig);
  }

  return (
    <div>
      <table className="table table-bordered">
        <thead>
          <tr className="dtaTop">
          {Object.keys(fake).map(key => (
              key != "type" ? (
              <th scope="col">
                <div align={align[key]}>
                  {fake[key]}
                </div>
              </th>
              ):null
          ))}
          </tr>
        </thead>
        {data ? data.map(getData => (
          getData.type=="data" ? (
            <tbody>
              <tr className={getRowClass()}>
                {Object.keys(getData).map(key => (
                  key != "type" ? (
                    <th scope="row">
                      <div align={align[key]}>
                        {getData[key]}
                      </div>
                    </th>
                  ):null
                ))}
              </tr>
            </tbody>
          ):null
        )):null}
        </table>
    </div>
  )
}

export function getRowClass(){
  cont = cont * -1
  if(cont==1){
    return "dtaRowA"
  }else{
    return "dtaRowB"
  }
}
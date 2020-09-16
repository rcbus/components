import { zeroLeft } from '../libs/functions'

export default class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        
      }
    }

    render(){
        return (
            <div className={this.props.cols}>
                <button 
                    type="button" 
                    className={
                        "btn btn-block command mt-3 " +
                        (this.props.command.status==0 ? 
                            "btn-primary" 
                        :(this.props.command.status==1 ? 
                            "btn-success" 
                        :(this.props.command.status==2 ? 
                            "btn-warning" 
                        : 
                            "btn-danger")))
                    }
                    onClick={() => this.props.callbackClick(this.props.command)}>
                    <b>{zeroLeft(this.props.command.number,3)}</b>
                </button>

                <style jsx>{`
                    .command{
                        height:100px;
                        font-size:36px;
                    }
                `}</style>
            </div>
        )
    }
}
/*
Definições das propriedades (props):

title - Título do card

className - Class bootstrap para o header do card

margin - Class bootstrap para margin do card
*/

export default class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show:(typeof this.props.show === 'undefined' ? true : this.props.show=='fixed' ? true : this.props.show)
      }
    }

    click = () => {
        if(typeof this.props.show !== 'undefined'){
            if(this.props.show!='fixed'){
                this.setState({
                    show:!this.state.show
                })        
            }
        }else{
            this.setState({
                show:!this.state.show
            })
        }
    }

    render(){
        return (
            <div className={"card " + this.props.margin}>
                <div className={"card-header cursor " + (!this.props.className ? "bg-info text-white" : this.props.className) + (this.state.show ? "" : " card-noShow")} onClick={() => this.click()}>
                    {!this.props.title ? "Card" : this.props.title}
                </div>
                <div className={"card-body " + (this.state.show ? "d-block" : "d-none")}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
var KeyInfo = React.createClass({
  render: function() {
    var url = this.props.get_url + "/" + this.props.bucket + "/" + this.props.xkey;
    return (
      <div className="keyInfo">
        File: <a href={url} target="_blank">{this.props.filename}</a>, Bucket: {this.props.bucket}, Size: {this.props.size}
      </div>
    );
  }
});

window.KeyInfo = KeyInfo;

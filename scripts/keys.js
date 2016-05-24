var KeyInfo = React.createClass({
  render: function() {
    var url = this.props.get_url + "/" + this.props.bucket + "/" + this.props.filename;
    return (
      <div className="keyInfo">
        File: <a href={url} target="_blank">{this.props.filename}</a>, Bucket: {this.props.bucket}
      </div>
    );
  }
});

window.KeyInfo = KeyInfo;

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var KeyInfo = React.createClass({
  render: function() {
    var url;
    var data;
    if (endsWith(this.props.filename, "(meta)")) {
      url = this.props.get_key_url + "/" + this.props.bucket + "/" + this.props.xkey;
      data = <div>
        File: <a href={url} download={this.props.filename} target="_blank">{this.props.filename}</a>, Bucket: {this.props.bucket}
      </div>
    } else {
      url = this.props.get_url + "/" + this.props.bucket + "/" + this.props.filename;
      data = <div>
        File: <a href={url} target="_blank">{this.props.filename}</a>, Bucket: {this.props.bucket}
      </div>
    }
    return (
      <div class="keyInfo">
        {data}
      </div>
    );
  }
});

window.KeyInfo = KeyInfo;

var TagInfo = React.createClass({
  onClick: function(event) {
    event.preventDefault();
    this.props.onClick(this.props.obj);
  },

  render: function() {
    return(
      <div>
        Tag: <a href="#" onClick={this.onClick}>{this.props.obj.name}</a>
      </div>
    );
  }
});

var ListTags = React.createClass({
  onClick: function(key) {
    this.props.onClick(this.props.list_tag, key);
  },

  render: function() {
    var listTags = this.props.list_tag.keys.map(function(key) {
      return (
        <TagInfo obj={key} onClick={this.onClick} key={key.name} />
      );
    }, this);

    return (
      <div>
        {listTags}
      </div>
    );
  }
});

var ListKeys = React.createClass({
  render: function() {
    var listKeys = this.props.list_tag.keys.map(function(key) {
      return (
        <KeyInfo get_url={this.props.get_url} bucket={key.bucket} filename={key.name} key={key.key} xkey={key.key} />
      );
    }, this);

    return (
      <div>
        { this.props.list_tag.name.name ? "Listing files for tag " + this.props.list_tag.name.name : null }
        {listKeys}
      </div>
    );
  }
});

var ListCtl = React.createClass({
  getInitialState: function() {
    return {
      meta_tag: {
        name: this.props.meta_tag,
        keys: [],
      },

      clicked_tag: {
        name: '',
        keys: [],
      }
    }
  },

  loadFromServer: function(url, tags, success, error) {
    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(tags),
      dataType: 'json',
      cache: false,
      success: function(reply) {
        success(reply);
      }.bind(this),
      error: error
    });
  },

  tagReplyOK: function(reply) {
    if (!reply.reply)
      return false;

    if (reply.error)
      return false;

    var lr = reply.reply;
    if (!lr.tags || lr.tags.length < 1)
      return false;

    return true;
  },

  onMetaTagLoaded: function(reply) {
    if (!this.tagReplyOK(reply))
      return;

    var lr = reply.reply;
    var tag = lr.tags[0];
    this.setState({
      meta_tag: {
        name: this.props.meta_tag,
        keys: tag.keys,
      }
    });
  },

  onClickedTagLoaded: function(reply) {
    if (!this.tagReplyOK(reply))
      return;

    var lr = reply.reply;
    var tag = lr.tags[0];
    this.setState({
      clicked_tag: {
        name: tag.tag,
        keys: tag.keys,
      }
    });
  },

  onLoadError: function(xhr, status, err) {
        console.error("onLoadError: status: %d, error: %s, data: %s", status, err.toString(), xhr.responseText);
  },

  componentDidMount: function() {
    var to = {};
    to.tags = [this.props.meta_tag];

    this.loadFromServer(this.props.list_meta_url, to, this.onMetaTagLoaded, this.onLoadError);
  },

  onMetaTagClick: function(tag, key) {
    var to = {};
    to.tags = [key.name];

    this.loadFromServer(this.props.list_url, to, this.onClickedTagLoaded, this.onLoadError);
  },

  onUploadSuccess: function(cmp) {
    var to = {};
    to.tags = [this.props.meta_tag];
    this.loadFromServer(this.props.list_meta_url, to, this.onMetaTagLoaded, this.onLoadError);

    if (this.state.clicked_tag.name != '') {
      var to = {};
      to.tags = [this.state.clicked_tag.name];
      this.loadFromServer(this.props.list_url, to, this.onClickedTagLoaded, this.onLoadError);
    }
  },

  render: function() {
    return (
      <div>
        <div className="metaTag">
          <ListTags list_tag={this.state.meta_tag} onClick={this.onMetaTagClick} />
        </div>
        <hr/>
        <div className="clickedTag">
          <ListKeys list_tag={this.state.clicked_tag} get_url={this.props.get_url} />
        </div>
        <div className="uploadBox">
          <UploadCtl upload_url={this.props.upload_url}
            get_url={this.props.get_url}
            get_key_url={this.props.get_key_url}
            index_url={this.props.index_url}
            onUploadSuccess={this.onUploadSuccess} />
        </div>
      </div>
    );
  }

});

window.ListCtl = ListCtl;

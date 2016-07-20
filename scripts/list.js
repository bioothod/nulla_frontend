function startsWith(str, prefix) {
    return str.indexOf(prefix, 0) === 0;
}

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

    if (listTags.length === 0) {
      listTags = <p>Here will be an automatically generated list of tags assigned to files you upload</p>
    }

    return (
      <div>
        {listTags}
      </div>
    );
  }
});

var ListKeys = React.createClass({
  render: function() {
    var listKeys = this.props.list_tag.keys.map(function(obj) {
      return (
        <KeyInfo
          obj={obj} key={obj.timestamp.toString() + "/" + obj.key} onClick={this.props.onClick} get_url={this.props.get_url}
        />
      );
    }, this);

    return (
      <div>
        { this.props.list_tag.name.name ? "Listing files for tag " + this.props.list_tag.name.name : <p>Here will be a list files for any tag you select</p> }
        {listKeys}
      </div>
    );
  }
});

var ListCtl = React.createClass({
  getInitialState: function() {
    return {
      content: {},

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

  GetKeyMetaData: function(obj, success, error) {
    var ctype = Mime.lookup(obj.name);
    obj.ctype = ctype;

    if (startsWith(ctype, "audio/") || startsWith(ctype, "video/")) {
      var url = this.props.meta_json_url + "/" + obj.bucket + "/" + obj.name;

      $.ajax({
        url: url,
        type: 'GET',
        cache: false,
        success: function(reply) {
          obj.media = reply;
          success(obj);
        },
        error: error,
      });
    } else {
      this.setState({content: obj});
    }
  },

  onKeyClick: function(obj) {
    this.GetKeyMetaData(
      obj,
      function(obj) {
        this.setState({content: obj});
      }.bind(this),
      function(xhr, status, err) {
        console.error("onKeyClick: status: %d, error: %s, data: %s", status, err.toString(), xhr.responseText);
      }
    );
  },

  onPlay: function(obj) {
    this.setState({content: obj});
  },

  render: function() {
    return (
      <div className="listCtl">
        <div className="metaTag">
          <ListTags list_tag={this.state.meta_tag} onClick={this.onMetaTagClick} />
        </div>
        <div className="clickedTag">
          <ListKeys list_tag={this.state.clicked_tag} onClick={this.onKeyClick} get_url={this.props.get_url} />
        </div>
        <div className="uploadBox">
          <UploadCtl upload_url={this.props.upload_url}  get_url={this.props.get_url}
            onClick={this.onKeyClick}
            onUploadSuccess={this.onUploadSuccess}
          />
          <hr/>
          <PlaylistCtl manifest_url={this.props.manifest_url} onPlay={this.onPlay}/>
        </div>
        <div className="contentBox">
          <ContentCtl obj={this.state.content} get_url={this.props.get_url} />
        </div>
      </div>
    );
  }

});

window.ListCtl = ListCtl;

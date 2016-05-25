var TagInfo = React.createClass({
  onClick: function(event) {
    event.preventDefault();
    this.props.onClick(this.props.obj);
  },

  render: function() {
    var ts = this.props.obj.timestamp;
    var d = new Date(ts.tsec * 1000 + ts.tnsec / 1000000.0);
    return(
      <div>
        Tag: <a href="#" onClick={this.onClick}>{this.props.obj.key}</a>, last time updated: {d.toString()}
      </div>
    );
  }
});

var ListTags = React.createClass({
  onClick: function(key) {
    this.props.onClick(this.props.list_tag, key);
  },

  render: function() {
    console.log("ListTags: render: props: %o", this.props);
    var listTags = this.props.list_tag.keys.map(function(key) {
      console.log("ListTags: keys: key: %o", key);
      return (
        <TagInfo obj={key} onClick={this.onClick} key={key.id} />
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
    console.log("ListKeys: props: %o", this.props);

    var listKeys = this.props.list_tag.keys.map(function(key) {
      return (
        <KeyInfo get_url={this.props.get_url} bucket={key.bucket} filename={key.key} key={key.key} />
      );
    }, this);

    return (
      <div>
        { this.props.list_tag.name.key ? "Listing files for tag " + this.props.list_tag.name.key : null }
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
        name: {},
        keys: [],
      }
    }
  },

  loadFromServer: function(tags, success, error) {
    console.log("loadFromServer: request: %o", tags);
    $.ajax({
      url: this.props.list_url,
      type: 'POST',
      data: JSON.stringify(tags),
      dataType: 'json',
      cache: false,
      success: function(reply) {
        console.log("loadFromServer: reply: %o", reply);
        success(reply);
      }.bind(this),
      error: error
    });
  },

  tagReplyOK: function(reply) {
    if (!reply.tags || reply.tags.length < 1)
      return false;

    var tag = reply.tags[0];
    if (tag.error)
      return false;

    return true;
  },

  onMetaTagLoaded: function(reply) {
    if (!this.tagReplyOK(reply))
      return;

    var tag = reply.tags[0];
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

    var tag = reply.tags[0];
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
    to.tags = [];

    this.loadFromServer(to, this.onMetaTagLoaded, this.onLoadError);
  },

  onMetaTagClick: function(tag, key) {
    console.log("onMetaTagClick: tag: %o, key: %o", tag, key);

    var to = {};
    to.tags = [key.key];

    this.loadFromServer(to, this.onClickedTagLoaded, this.onLoadError);
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
      </div>
    );
  }

});

window.ListCtl = ListCtl;

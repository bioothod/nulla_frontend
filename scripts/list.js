var TagObject = React.createClass({
  onClick: function(event) {
    event.preventDefault();
    this.props.onClick(this.props.obj);
  },

  render: function() {
    var ts = this.props.obj.timestamp;
    var d = new Date(ts.tsec * 1000 + ts.tnsec / 1000000.0);
    return(
      <div>
        <a href="#" onClick={this.onClick}>{this.props.obj.key}</a>, last time updated: {d.toString()}
      </div>
    );
  }
});

var ListTagsBox = React.createClass({
  onClick: function(key) {
    this.props.onClick(this.props.tag, key);
  },

  render: function() {
    var listNodes = this.props.keys.map(function(key) {
      console.log("ListTagsBox: keys: key: %o", key);
      return (
        <TagObject obj={key} onClick={this.onClick} key={key.id} />
      );
    }, this);

    return (
      <div className="listNodes">
        <div>Your metadata tag: bucket: {this.props.tag.bucket}, key: {this.props.tag.key}</div>
        <div>You have files uploaded into these tags (click to get list of keys below):</div>
        {listNodes}
      </div>
    );
  }
});

var ListTags = React.createClass({
  render: function() {
    console.log("ListTags: render: props: %o", this.props);
    var listTags = this.props.tags.map(function(tag) {
      if (tag.error && tag.error.code != 0) {
        console.log("ListTags: render: error: %o", tag.error);
        return null;
      }

      return (
        <ListTagsBox tag={tag.tag} keys={tag.keys} onClick={this.props.onClick} key={tag.tag} />
      );
    }, this);

    var listKeys = this.props.clicked_tag.keys.map(function(key) {
      return (
        <KeyInfo get_url={this.props.get_url} bucket={key.bucket} filename={key.key} key={key.key} />
      );
    }, this);

    return (
      <div className="listTags">
        <div className="listMetaTags">
          {listTags}
        </div>
        <hr/>
        <div className="listKeys">
          {this.props.clicked_tag.name.key ? "Listing files for tag " + this.props.clicked_tag.name.key : null}
          {listKeys}
        </div>
        <hr/>
      </div>
    );
  }
});

var ListCtl = React.createClass({
  getInitialState: function() {
    return {
      tags_object: {
        tags: [],
      },

      clicked_tag: {
        name: {},
        keys: [],
      }
    }
  },

  loadTagsFromServer: function(tags) {
    console.log("loadTagsFromServer: request: %o", tags);
    $.ajax({
      url: this.props.list_url,
      type: 'POST',
      data: JSON.stringify(tags),
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("loadTagsFromServer: reply: %o", data);
        this.setState({tags_object: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.list_url, status, err.toString());
      }.bind(this)
    });
  },

  loadClickedTagFromServer: function(tags) {
    console.log("loadClickedTagFromServer: request: %o", tags);
    $.ajax({
      url: this.props.list_url,
      type: 'POST',
      data: JSON.stringify(tags),
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("loadClickedTagFromServer: reply: %o", data);
        if (data.error && data.error.code != 0) {
          console.log("loadTagsFromServer: reply: error: %o", data.error);
          return;
        }

        if (data.tags.length >= 1) {
          var tag = data.tags[0];
          this.setState({
            clicked_tag: {
              name: tag.tag,
              keys: tag.keys,
            }
          });
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.list_url, status, err.toString());
      }.bind(this)
    });
  },

  onClick: function(tag, key) {
    var tags = {};
    tags["tags"] = [key.key];

    this.loadClickedTagFromServer(tags);
  },

  componentDidMount: function() {
    var tags = {};

    if (this.state.tags_object) {
      tags = this.state.tags_object;
    } else {
      tags["tags"] = [];
    }

    this.loadTagsFromServer(tags);
  },

  render: function() {
    return (
      <ListTags tags={this.state.tags_object.tags} onClick={this.onClick} clicked_tag={this.state.clicked_tag} get_url={this.props.get_url} />
    );
  }

});

window.ListCtl = ListCtl;

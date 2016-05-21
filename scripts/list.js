var ListObject = React.createClass({
  onClick: function(event) {
    event.preventDefault();
    this.props.onClick(this.props.obj);
  },

  render: function() {
    var ts = this.props.obj.timestamp;
    var d = new Date(ts.tsec * 1000 + ts.tnsec / 1000000.0);
    return(
      <label onClick={this.onClick}>bucket: {this.props.obj.bucket}, key: {this.props.obj.key}, id: {this.props.obj.id}, timestamp: {d.toLocaleDateString()}</label>
    );
  }
});

var ListBox = React.createClass({
  onClick: function(key) {
    this.props.onClick(this.props.tag, key);
  },

  render: function() {
    var listNodes = this.props.keys.map(function(obj) {
      return (
        <ListObject obj={obj} onClick={this.onClick} />
      );
    });

    return (
      <div className="listNodes">
        <div className="tagName">Tag: bucket: {this.props.tag.bucket}, key: {this.props.tag.key}</div>
  	    {listNodes}
      </div>
    );
  }
});

var ListTags = React.createClass({
  render: function() {
    console.log("ListTags: render: props: %o", this.props);
    var listTags = this.props.tags.map(function(tag) {
      return (
        <ListBox tag={tag.tag} keys={tag.keys} onClick={this.props.onClick} key={tag.tag} />
      );
    }, this);

    return (
      <div className="listTags">
        {listTags}
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

  onClick: function(tag, key) {
    console.log("clicked on tag: %s, key: %s", tag, key);
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
      <ListTags tags={this.state.tags_object.tags} onClick={this.onClick} />
    );
  }

});

window.ListCtl = ListCtl;

var UploadBox = React.createClass({
  onSuccess: function(cmp) {
    this.props.onSuccess(cmp);
  },
  onError: function(cmp) {
    this.props.onError(cmp);
  },

  onDrop: function (files) {
    this.props.uploadInit();

    files.forEach((file)=> {
      console.log('Uploading file: %s', file.name);

      var data = new FormData();
      data.append(file.name, file);

      $.ajax({
        url: this.props.url + "/" + file.name,
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR) {
          this.onSuccess({file: file.name, status: jqXHR.status, data: jqXHR.responseText});
        }.bind(this),
        error: function(jqXHR, textStatus, err) {
          var status = jqXHR.status;
          if (status === 0) {
            status = -22;
          }

          this.onError({file: file.name, status: status, data: jqXHR.responseText});
        }.bind(this),
      });
    });
  },

  render: function () {
    return (
      <div>
        <Dropzone onDrop={this.onDrop}>
          <div>Try dropping some files here, or click to select files to upload.</div>
        </Dropzone>
      </div>
    );
  }
});

var UploadCompletion = React.createClass({
  render: function() {
    console.log("UploadCompletion: %o", this.props.reply);
    var obj = JSON.parse(this.props.reply.data);
    return (
      <KeyInfo get_url={this.props.get_url} bucket={obj.bucket} filename={obj.key} />
    );
  }
});

var UploadError = React.createClass({
  render: function() {
    return (
      <div className="uploadCompletion">
        <p>File: {this.props.reply.file}, Status: {this.props.reply.status}, Reply: {this.props.reply.data}</p>
      </div>
    );
  }
});


var UploadStatus = React.createClass({
  render: function() {
    var upload_completions = this.props.completions.map(function(cmp) {
      console.log("completed: %o", cmp);
      return (
        <UploadCompletion reply={cmp} get_url={this.props.get_url} key={cmp.file} />
      );
    }, this);

    var upload_errors = this.props.errors.map(function(cmp) {
      return (
        <UploadError filename={cmp.file} reply={cmp} key={cmp.file} />
      );
    }, this);

    return (
      <div className="uploadCompletionList">
        { upload_completions.length >= 1 ? "You have uploaded following files in the last uploading session" : "You have not uploaded any files yet" }
        {upload_completions}
        { upload_errors.length >= 1 ? "Following files have not been uploaded because of errors" : null }
        {upload_errors}
      </div>
    );
  }
});

var UploadCtl = React.createClass({
  getInitialState: function() {
    return {
      completions: [],
      errors: [],
    };
  },

  upload_init: function() {
    this.setState({completions: []});
  },

  index_update: function(cmp) {
    var reply = JSON.parse(cmp.data);
    var idx = {};
    var fidx = {};
    fidx.key = reply.key;
    fidx.bucket = reply.bucket;
    fidx.tags = [];

    idx.files = [fidx];

    $.ajax({
      url: this.props.index_url,
      type: 'POST',
      data: JSON.stringify(idx),
      cache: false,
      dataType: 'json',
      processData: false, // Don't process the files
      contentType: false, // Set content type to false as jQuery will tell the server its a query string request
      success: function(data) {
        cmp.index = data;
        var cmps = this.state.completions;
        var new_cmps = cmps.concat([cmp]);
        this.setState({completions: new_cmps});

        this.props.onUploadSuccess(cmp);
      }.bind(this),
      error: function(jqXHR, textStatus, err) {
        var status = jqXHR.status;
        if (status === 0) {
          status = -22;
        }

        this.upload_error({file: cmp.file, status: status, data: jqXHR.responseText});
      }.bind(this),
    });
  },

  upload_completed: function(cmp) {
    this.index_update(cmp);
  },

  upload_error: function(cmp) {
    var cmps = this.state.errors;
    var new_cmps = cmps.concat([cmp]);
    this.setState({errors: new_cmps});
  },

  render: function() {
      return (
        <div className="uploadCtl">
          <UploadStatus completions={this.state.completions} errors={this.state.errors} get_url={this.props.get_url} />
          <UploadBox url={this.props.upload_url}
            onSuccess={this.upload_completed} onError={this.upload_error} uploadInit={this.upload_init} />
        </div>
      );
  }
});

window.UploadCtl = UploadCtl;

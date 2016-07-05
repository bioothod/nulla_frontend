var UploadBox = React.createClass({
  onDrop: function (files) {
    this.props.clear_upload_state();

    files.forEach((file)=> {

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
          this.props.onSuccess({file: file.name, status: jqXHR.status, reply: data});
        }.bind(this),
        error: function(jqXHR, textStatus, err) {
          var status = jqXHR.status;
          if (status === 0) {
            status = -22;
          }

          this.props.onError({file: file.name, status: status, text: jqXHR.responseText});
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
    var cmp = this.props.cmp;
    var io = cmp.reply.reply[0];
    return (
      <KeyInfo obj={io} onClick={this.props.onClick} />
    );
  }
});

var UploadError = React.createClass({
  render: function() {
    return (
      <div className="uploadCompletion">
        <p>File: {this.props.reply.file}, Status: {this.props.reply.status}, Reply: {this.props.reply.text}</p>
      </div>
    );
  }
});


var UploadStatus = React.createClass({
  render: function() {
    var upload_completions = this.props.completions.map(function(cmp) {
      return (
        <UploadCompletion cmp={cmp} onClick={this.props.onClick}
          key={cmp.time.toString() + "/" + cmp.file} />
      );
    }, this);

    var upload_errors = this.props.errors.map(function(cmp) {
      return (
        <UploadError filename={cmp.file} reply={cmp} key={cmp.time.toString() + "/" + cmp.file} />
      );
    }, this);

    return (
      <div className="uploadCompletionList">
        <p>{ upload_completions.length >= 1 ? "You have uploaded following files in the last uploading session" : "You have not uploaded any files yet" }</p>
        {upload_completions}
        <p>{ upload_errors.length >= 1 ? "Following files have not been uploaded because of errors" : null }</p>
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

  clear_upload_state: function() {
    this.setState(this.getInitialState());
  },

  upload_completed: function(cmp) {
    var d = new Date();
    cmp.time = d.getTime();
    console.log("upload completed: %o", cmp);

    var cmps = this.state.completions;
    var new_cmps = cmps.concat([cmp]);
    this.setState({completions: new_cmps});

    this.props.onUploadSuccess(cmp);
  },

  upload_error: function(cmp) {
    var d = new Date();
    cmp.time = d.getTime();

    var cmps = this.state.errors;
    var new_cmps = cmps.concat([cmp]);
    this.setState({errors: new_cmps});
  },

  render: function() {
      return (
        <div className="uploadCtl">
          <UploadStatus
            completions={this.state.completions}
            errors={this.state.errors}
            onClick={this.props.onClick}
          />
          <UploadBox url={this.props.upload_url} onSuccess={this.upload_completed} onError={this.upload_error}
            clear_upload_state={this.clear_upload_state} />
        </div>
      );
  }
});

window.UploadCtl = UploadCtl;

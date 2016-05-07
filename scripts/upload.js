var Dropzone = require('react-dropzone');
var UploadBox = React.createClass({
  onDrop: function (files) {
    files.forEach((file)=> {
      console.log('Uploading file: %s', file.name);

      var data = new FormData();
      data.append(file.name, file);

      $.ajax({
        url: this.props.url + file.name,
        type: 'POST',
        data: data,
	context: this,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR) {
	    this.props.uploadCompleted({file: file.name, status: jqXHR.status, data: jqXHR.responseText});
        },
        error: function(jqXHR, textStatus, err) {
	  var status = jqXHR.status;
	  if (status === 0) {
	    status = -22;
	  }
	  console.log('Could not upload file %s, code: %d: %s/%s', file.name, jqXHR.statusCode(), textStatus, err.toString());
	  this.props.uploadCompleted({file: file.name, status: status, data: jqXHR.responseText});
        }
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
      return (
        <div className="uploadCompletion">
	  <p>File: {this.props.file}, Status: {this.props.status}</p>
          <pre>{this.props.data}</pre>
        </div>
      );
  }
});

var UploadStatus = React.createClass({
  render: function() {
    var upload_completion = this.props.completions.map(function(cmp) {
      return (
        <UploadCompletion key={cmp.file} file={cmp.file} status={cmp.status} data={cmp.data} />
      );
    });

    return (
      <div className="uploadCompletionList">
  	{upload_completion}
      </div>
    );
  }
});

var UploadCtl = React.createClass({
  getInitialState: function() {
    return {completions: []};
  },

  upload_completed: function(cmp) {
    var cmps = this.state.completions;
    var new_cmps = cmps.concat([cmp]);
    this.setState({completions: new_cmps});
  },

  render: function() {
    return (
      <div className="uploadCtl">
        <UploadStatus completions={this.state.completions} />
        <UploadBox url={this.props.url} uploadCompleted={this.upload_completed} />
      </div>
    );
  }
});


ReactDOM.render(
  <UploadCtl url="http://localhost:8080/upload/" />,
  document.getElementById('upload')
);

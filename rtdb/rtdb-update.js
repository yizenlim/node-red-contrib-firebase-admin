

module.exports = function(RED) {
  function FirebaseAdmin(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    if(config.cred){
      let c = RED.nodes.getNode(config.cred)
      this.admin = c.admin
    }

    node.on('input', function(msg) {
      if(msg && msg.payload){
        console.log('rtdb-update got input')
        console.dir(msg)
        const path = msg.payload.path
        const obj = msg.payload.obj
        console.log('storing '+obj+' at rtdb path '+path)
        this.admin.database().ref(path).update(obj).then((res)=>{
          console.log('firebase update result '+res)
          console.dir(res)
        }).catch((err)=>{
          console.log('------ ERROR ------')
          console.dir(err)
        })
      }
    }.bind(this));


  }
  RED.nodes.registerType("rtdb-update", FirebaseAdmin);
}
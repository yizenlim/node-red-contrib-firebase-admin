

let oldpath
let msgin

module.exports = function(RED) {

  function FirebaseAdmin(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const cb = (res)=>{
      console.log('firebase get result '+res)
      //console.dir(res)
      let val = res.val()
      //console.dir(val)
      if(msgin){
        msgin.payload = val
        node.send(msgin)
      } else {
        node.send({payload: val})
      }

    }

    let setUpListener = (path, ontype , limittofirst, orderbychild)=>{
      console.log('rtdb-on setUpListener for path '+path)


      var query;
      var oldPathQuery;
      if(path !=null){
        
        query = this.admin.database().ref(path)}
       if (oldpath!=null ){
        oldPathQuery =  this.admin.database().ref(oldpath);
       }
    
       if(orderbychild!=null && orderbychild != "" && orderbychild !== "undefined"){
        if(oldpath!=null&& oldPathQuery !=null){
         oldPathQuery = oldPathQuery.orderByChild(orderbychild)
        }
        if(path!=null){
          query= query.orderByChild(orderbychild)
          oldpath = path
        }  else {
          console.log('----- rtdb-on got empty path !!')
          console.dir(config)
        }

      } 
       
      if(limittofirst!=null && limittofirst != "" && limittofirst !== "undefined"){
        if(oldpath!=null&& oldPathQuery !=null){
         oldPathQuery = oldPathQuery.limitToFirst(limittofirst)
        }
        if(path!=null){
          query= query.limitToFirst(limittofirst)
          oldpath = path
        }  else {
          console.log('----- rtdb-on got empty path !!')
          console.dir(config)
        }

      } 
       
      if(ontype!=null&& oldPathQuery !=null){
        if(oldpath!=null){
         oldPathQuery = oldPathQuery.off(ontype, cb)
        }
        if(path!=null){
          query= query.on(ontype, cb)
          oldpath = path
        }  else {
          console.log('----- rtdb-on got empty path !!')
          console.dir(config)
        }

      }  else       
      
      {
      if(oldpath!=null && oldPathQuery !=null){
        oldPathQuery = oldPathQuery.off('value', cb)
      }
      if(path!=null){
        query= query.on('value', cb)
        oldpath = path
      }  else {
        console.log('----- rtdb-on got empty path !!')
        console.dir(config)
      }}
    }

    if(config.cred){
      let c = RED.nodes.getNode(config.cred)
      this.admin = c.admin
    }

    //console.log('------------------------------- rtdg-get config')
    //console.dir(config)
    this.path = config.path
    this.ontype = config.ontype
    this.limittofirst = config.limittofirst
    this.orderbychild = config.orderbychild


    if (this.ontype ){
      if(this.path){
        setUpListener(this.path,this.ontype, this.limittofirst,this.orderbychild)
      }  
    }
    else
    if(this.path){
      setUpListener(this.path)
    }


    //console.log('configuring rtdb-on to listen for messages')
    node.on('input', function(msg) {
      let path = this.path
      let ontype = this.ontype
      let limittofirst = this.limittofirst
      let orderbychild = this.orderbychild

      if(msg && msg.payload){
        path = path || msg.payload.path
        ontype = ontype || msg.payload.ontype
        limittofirst = limittofirst || msg.payload.limittofirst
        orderbychild = orderbychild || msg.payload.orderbychild

        
        msgin = msg
        setUpListener(path , ontype , limittofirst, orderbychild)
      }
    }.bind(this));

  }
  RED.nodes.registerType("rtdb-on", FirebaseAdmin);
}
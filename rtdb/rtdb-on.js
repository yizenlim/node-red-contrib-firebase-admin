

let oldpath
let msgin

module.exports = function(RED) {

  function FirebaseAdmin(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    const cb = (res )=>{
      console.log('firebase get result '+res)
      //console.dir(res)
      let val = res.val()
      //console.dir(val)
      if(msgin){
        msgin.payload = val
        node.send(msgin)
      } else {
        node.send({payload: val , })
      }

    }

    let setUpListener = (path, ontype , limittolast, orderbychild)=>{
      console.log('rtdb-on setUpListener for path '+path)


      var query;
      var oldPathQuery;
      var pathString = [];
      if(path !=null){
        pathString.push({"path":path.toString()})
        query = this.admin.database().ref(path)}
       if (oldpath!=null ){
        pathString.push({"oldpath":oldpath.toString()})
        
        oldPathQuery =  this.admin.database().ref(oldpath);
       }
    
       if(orderbychild!=null && orderbychild != "" && orderbychild !== "undefined"){
        if(oldpath!=null&& oldPathQuery !=null){
         oldPathQuery = oldPathQuery.orderByChild(orderbychild)
         pathString.push({"oldPathQuery":oldPathQuery.toString()})
    
        }
        if(path!=null){
          query= query.orderByChild(orderbychild)
      
          pathString.push({"query":query.toString()})
          oldpath = path
        }  else {
          console.log('----- rtdb-on got empty path !!')
          console.dir(config)
        }

      } 
       
      if(limittolast!=null && limittolast != "" && limittolast !== "undefined"){
        if(oldpath!=null&& oldPathQuery !=null){
         oldPathQuery = oldPathQuery.limitToLast(limittolast)
         pathString.push({"oldPathQuery":oldPathQuery.toString()})
        }
        if(path!=null){
          
          query= query.limitToLast(limittolast)
          pathString.push({"query":query.toString()})

          oldpath = path
        }  else {
          console.log('----- rtdb-on got empty path !!')
          console.dir(config)
        }

      } 
       
      if(ontype!=null&& oldPathQuery !=null){
        if(oldpath!=null){
        oldPathQuery.off(ontype, cb)
         pathString.push({"oldPathQuery":oldPathQuery.toString()})
        }
        if(path!=null){
         query.on(ontype, cb)
          pathString.push({"query":query.toString()})
          oldpath = path
        }  else {
          console.log('----- rtdb-on got empty path !!')
          console.dir(config)
        }

      }  else       
      
      {
      if(oldpath!=null && oldPathQuery !=null){
          oldPathQuery.off('value', cb)
          pathString.push({"oldPathQuery":oldPathQuery.toString()})
        }
      if(path!=null){
       query.on('value', cb)
       pathString.push({"query":query.toString()})
       oldpath = path
      }  else {
        console.log('----- rtdb-on got empty path !!')
        console.dir(config)
      }}
      node.send({"pathString":pathString})

      
    }

    if(config.cred){
      let c = RED.nodes.getNode(config.cred)
      this.admin = c.admin
    }

    //console.log('------------------------------- rtdg-get config')
    //console.dir(config)
    this.path = config.path
    this.ontype = config.ontype
    this.limittolast = config.limittolast
    this.orderbychild = config.orderbychild


    if (this.ontype ){
      if(this.path){
        setUpListener(this.path,this.ontype, this.limittolast,this.orderbychild)
      }  
    }
    else
    if(this.path){
      setUpListener(this.path,this.ontype, this.limittolast,this.orderbychild)
    }


    //console.log('configuring rtdb-on to listen for messages')
    node.on('input', function(msg) {
      let path = this.path
      let ontype = this.ontype
      let limittolast = this.limittolast
      let orderbychild = this.orderbychild

      if(msg && msg.payload){
        path = path || msg.payload.path
        ontype = ontype || msg.payload.ontype
        limittolast = limittolast || msg.payload.limittolast
        orderbychild = orderbychild || msg.payload.orderbychild

        
        msgin = msg
        setUpListener(path , ontype , limittolast, orderbychild)
      }
    }.bind(this));

  }
  RED.nodes.registerType("rtdb-on", FirebaseAdmin);
}
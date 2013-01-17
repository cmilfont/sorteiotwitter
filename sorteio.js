Ext.onReady(function(){
  
  /* function presente a partir do 4.1.2 */
  Ext.override(Ext.view.View, {
    focusNode: function(rec){
      var me          = this,
          node        = me.getNode(rec),
          el          = me.el,
          adjustmentY = 0,
          adjustmentX = 0,
          elRegion    = el.getRegion(),
          nodeRegion;

      // Viewable region must not include scrollbars, so use
      // DOM client dimensions
      elRegion.bottom = elRegion.top + el.dom.clientHeight;
      elRegion.right = elRegion.left + el.dom.clientWidth;
      if (node) {
        nodeRegion = Ext.fly(node).getRegion();
        // node is above
        if (nodeRegion.top < elRegion.top) {
          adjustmentY = nodeRegion.top - elRegion.top;
        // node is below
        } else if (nodeRegion.bottom > elRegion.bottom) {
          adjustmentY = nodeRegion.bottom - elRegion.bottom;
        }

        // node is left
        if (nodeRegion.left < elRegion.left) {
          adjustmentX = nodeRegion.left - elRegion.left;
        // node is right
        } else if (nodeRegion.right > elRegion.right) {
          adjustmentX = nodeRegion.right - elRegion.right;
        }

        if (adjustmentX || adjustmentY) {
          me.scrollBy(adjustmentX, adjustmentY, false);
        }
        el.focus();
      }
    }
  });
  
  
  Ext.define('Tweet', {
    extend: 'Ext.data.Model',
    fields: ['id_str', 'from_user', 'from_user_name', 'profile_image_url', 'text', { name: "created_at", type: "date"}]
  });

  Ext.define("Tweets", {
    extend: 'Ext.data.Store',
    model: 'Tweet',
    pageSize: 100,
    proxy: {
      type: 'jsonp',
      url : 'http://search.twitter.com/search.json',
      reader: { 
        root: 'results' 
      }
    }
  });

  Ext.define("Concorrentes", {
    extend: "Ext.view.View",
    alias: 'widget.concorrentes',
    store: Ext.create('Tweets'),
    tpl: Ext.XTemplate.from( Ext.get("template") ),
    itemSelector: 'div.twitter-tweet-rendered',
    emptyText: 'No twitts available',
    autoScroll: true,
    style: {
      background: "#8BA341"
    },
    sortear: function() {
      var tweets = this.getStore();
      var vencedor = Math.floor(Math.random() * (tweets.getTotalCount()) );
      return this.selecionar( tweets.getAt( vencedor ) );
    },
    selecionar: function(tweet) {
      if(tweet) {
        this.focusNode(tweet);
        Ext.get( this.getNode(tweet) ).child(".twt-border").addCls("sorteado");        
      }
      return tweet;
    },
    listar: function(busca) {
      this.getStore().load({
        params: {
          rpp: 100,
          q: busca
        }
      })
    }
  });
  
  Ext.define("Ganhadores", {
    extend: "Ext.panel.Panel",
    alias: 'widget.ganhadores',
    title: "Ganhadores",
    tbar: [
      { xtype: 'button', text: 'Sortear', itemId: 'sortear'}
    ],
    tpl: Ext.XTemplate.from( Ext.get("vencedor") ),
    sorteioCallback: Ext.emptyFn,
    initComponent: function() {
      this.callParent();
      this.down("#sortear").setHandler(function(){
        var vencedor = this.sorteioCallback.call( this.sorteioCallbackScope || this );
        if(vencedor) this.update(vencedor.data);
      }, this); 
    }
  });
  
  Ext.define("BasePanel", {
    alias: 'widget.basepanel',
    extend: "Ext.panel.Panel",
    style: {
      background: "#8BA341 url(https://twimg0-a.akamaihd.net/a/1357340276/t1/img/wash-white-30.png)"
    },
    bodyStyle: {
      background: 'transparent',
      border: '0'
    }
  });
  
  Ext.define("Busca", {
    extend: "Ext.form.field.Text",
    alias: 'widget.busca',
    fieldLabel: "Busca", 
    name: "busca", 
    value: "http://www.javace.org/lancamento-da-casa-do-codigo/"
  });
  
  Ext.define("SorteioForm", {
    extend: "Ext.form.Panel",
    alias: 'widget.sorteioform',
    width: 360,
    mixins: ["BasePanel"],
    items: [
      { xtype: "busca", labelWidth: 40, labelPad: 0, width: 350 },
      { xtype: "button", itemId: 'busca', text: "Listar"}
    ],
    buscar: function() {
      this.fireEvent("busca", this.getForm().getValues());
    },
    initComponent: function() {
      this.callParent();
      this.down("#busca").setHandler(this.buscar, this);
    }
  });
  
  Ext.define("Sorteio", {
    extend: "Ext.panel.Panel",
    alias: 'widget.sorteio',
    layout: "border",
    // sortear: function() {
    //   this.ganhadores.adicionar( this.concorrentes.sortear() );
    // },
    criarRegiao: function() {
      return {
        xtype: 'basepanel',
        region: 'west', 
        frame: true,
        items: [
          this.sorteioform = Ext.widget("sorteioform") ,
          this.ganhadores  = Ext.widget("ganhadores", { 
            minHeight: 80, 
            margin: "10 0 0 0",
            sorteioCallback: this.concorrentes.sortear,
            sorteioCallbackScope: this.concorrentes
          })
        ]
      }
    },
    // reiniciar: function(values) {
    //   this.concorrentes.listar(values);
    //   this.ganhadores.update("");
    // },
    initComponent: function() {
      this.callParent();
      this.add( this.concorrentes = Ext.widget("concorrentes", {region: 'center'}) );
      this.add( this.criarRegiao() );
      //this.sorteioform.on("busca", this.reiniciar, this);
      

      
            this.sorteioform.on("busca", 
              Ext.Function.createSequence(this.concorrentes.listar, 
                                          Ext.Function.pass(this.ganhadores.update, ""),
                                          this.ganhadores), 
              this.concorrentes);

    }
  });
    
  Ext.create("Sorteio", {
    renderTo: Ext.getBody(),
    title: "Workshop ExtJS 4",
    height: screen.availHeight
  });
  
});
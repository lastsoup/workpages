/**数据库封装2018-4-12-Cqy*/
var mssql=require('mssql');
var sql={};
//连接参数配置
var configString="mssql://lastsoup:19890905@103.42.176.10:1433/lastsoup";
var config={
    user:"lastsoup",
    password:"19890905",
    server:"103.42.176.10",
    port:1433,
    database:"lastsoup",
    stream:false,
    pool:{
        min:0,
        idleTimeoutMillis:3000
    }
};

/*
 sql.execute=function(){
 mssql.connect(strContect).then(function(){
 //Query
 new mssql.Request().query('select * from Ananas_User where ID=3939731393').then(function(data){
 console.dir(data);
 }).catch(function(err){
 console.log(err);
 });

 }).catch(function(err){
 console.log(err);
 });
 }
 */

/**
 * 执行sql文本(带params参数)
 * @param {string} sqltext 执行的sql语句
 * @param {JSON} params sql语句中的参数
 * @param {function} func 回调函数 共有三个参数 error:错误消息 recordsets:查询的结果 affected:影响的行数
 */

sql.queryWithParams=function(sqltext,params,func){
    try {
        mssql.connect(config).then(function(){
            var request=new mssql.Request();
            request.multiple=true;
            if(params){
                for(var index in params){
                    request.input(index,params[index].sqlType,params[index].inputValue);
                }
            }
            request.query(sqltext).then(func).catch(func);
        }).catch(func);
    }catch(e){
        func(e);
    }
};

/**
 * 执行sql文本
 * @param {string} sqltext 执行的sql语句
 * @param {function} func 回调函数 共有三个参数 error:错误消息 recordsets:查询的结果 affected:影响的行数
 */
sql.query=function(sqltext,func){
    sql.queryWithParams(sqltext,null,func);
};


/**
 * 执行大批量数据的插入
 * @param {sqlserver.Table} table 需要插入的数据表
 * 数据表的定义如下：
 var table=new sql.sqlserver.Table('UserInfoTest');
 table.create=true;
 table.columns.add('name',sqlHelper.sqlserver.NVarChar(50),{nullable:true});
 table.columns.add('pwd',sqlHelper.sqlserver.VarChar(200),{nullable:true});
 table.rows.add('张1','jjasdfienf');
 table.rows.add('张2','jjasdfienf');
 table.rows.add('张3','jjasdfienf');
 * @param {function} func 回调函数 共有两个参数 error:错误信息 rowcount:插入数据的行数
 */
sql.bulkInsert=function(table,func){
    try{
        if(table){
            var connection=new mssql.Connection(config,function(err){
                if(err) func(err)
                else{
                    var request=new mssql.Request(connection);
                    request.bulk(table,func);
                }
            });
            connection.on("error",func);
        }
        else
            func(new ReferenceError('table parameter undefined!'));
    }catch (e){
        func(e);
    }
};

/**
 * 如果需要处理大批量的数据行，通常应该使用流
 * @param {string} sqltext 需要执行的sql文本
 * @param {JSON} params 输入参数
 * @param {JSON} func 表示一个回调函数的JSON对象，如下所示：
 * {
    error:function(err){
        console.log(err);
    },
    columns:function(columns){
        console.log(columns);
    },
    row:function(row){
        console.log(row);
    },
    done:function(affected){
        console.log(affected);
    }
 */
sql.queryViaStreamWithParams=function(sqltext,params,func){
    try{
        config.stream=true;

        mssql.connect(config,function(err){
            if(err)
                func.error(err);
            else{
                var request=new mssql.Request();
                request.stream=true;// You can set streaming differently for each request
                if(params){
                    for(var index in params){
                        request.input(index,params[index].sqlType,params[index].inputValue);
                    }
                }

                request.query(sqltext);

                request.on('recordset',function(columns){
                    //columns是一个JSON对象，表示 返回数据表的整个结构，包括每个字段名称以及每个字段的相关属性
                    //如下所示
                    /*
                     { id:
                     { index: 0,
                     name: 'id',
                     length: undefined,
                     type: [sql.Int],
                     scale: undefined,
                     precision: undefined,
                     nullable: false,
                     caseSensitive: false,
                     identity: true,
                     readOnly: true },
                     name:
                     { index: 1,
                     name: 'name',
                     length: 100,
                     type: [sql.NVarChar],
                     scale: undefined,
                     precision: undefined,
                     nullable: true,
                     caseSensitive: false,
                     identity: false,
                     readOnly: false },
                     Pwd:
                     { index: 2,
                     name: 'Pwd',
                     length: 200,
                     type: [sql.VarChar],
                     scale: undefined,
                     precision: undefined,
                     nullable: true,
                     caseSensitive: false,
                     identity: false,
                     readOnly: false } }
                     */
                    func.columns(columns);
                });

                request.on('row', function(row) {
                    //row是一个JSON对象，表示 每一行的数据，包括字段名和字段值
                    //如 { id: 1004, name: 'jsw', Pwd: '12345678' }
                    //如果行数较多，会多次进入该方法，每次只返回一行
                    func.row(row);
                });

                request.on('error', function(err) {
                    //err是一个JSON对象，表示 错误信息
                    //如下所示：
                    /*
                     { [RequestError: Incorrect syntax near the keyword 'from'.]
                     name: 'RequestError',
                     message: 'Incorrect syntax near the keyword \'from\'.',
                     code: 'EREQUEST',
                     number: 156,
                     lineNumber: 1,
                     state: 1,
                     class: 15,
                     serverName: '06-PC',
                     procName: '' }
                     */
                    func.error(err);
                });

                request.on('done', function(affected) {
                    //affected是一个数值，表示 影响的行数
                    //如 0
                    //该方法是最后一个执行
                    func.done(affected);
                });
            }
        });

        mssql.on('error',func.error);
    }catch(e){
        func.error(e);
    }finally{
        config.stream=false;
    }
};

/**
 * 如果需要处理大批量的数据行，通常应该使用流
 * @param {string} sqltext 需要执行的sql文本
 * @param {JSON} func 表示一个回调函数的JSON对象，如下所示：
 * {
    error:function(err){
        console.log(err);
    },
    columns:function(columns){
        console.log(columns);
    },
    row:function(row){
        console.log(row);
    },
    done:function(affected){
        console.log(affected);
    }
 */
sql.queryViaStream=function(sqltext,func){
    sql.queryViaStreamWithParams(sqltext,null,func);
};

module.exports=sql;
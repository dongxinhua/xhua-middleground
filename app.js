const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// // parse application/x-www-form-urlencoded  使用express内置 body-parser中间件
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(express.static("./"));

// app.use((req, res, next) => {
//   // 在这里设置响应头，允许资源共享
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   next();
// });

app.use(cors());

app.listen(4399, function () {
  console.log("服务器开启监听4399端口...");
  mongoose.connect('mongodb://localhost/xhua-mobile-bs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

mongoose.connection.on("open", function () {
  console.log("数据库链接成功!");

  /*
      创建一个数据结构
      1. nickname  String
      2. username  Number
      3. password  String
      4. rank  number (0-2)
    */

  const user = new mongoose.Schema({
    nickname: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    rank: {
      type: Number
    }
  }, { collection: "user", versionKey: false });

  // const order = new mongoose.Schema({
  //   userId: {
  //     type: Number
  //   },
  //   shopId: {
  //     type: Number
  //   },
  //   date: {
  //     type: Number
  //   },
  //   shopName: {
  //     type: String
  //   },
  //   shopImg: {
  //     type: String
  //   },
  //   float_delivery_fee: {
  //     type: Number
  //   },
  //   address: {
  //     type: Object
  //   },
  //   foods: [foodItem]
  // }, { collection: "ordersCar", versionKey: false });

  const userModel = mongoose.model("user", user);
  // const myModel2 = mongoose.model("ordersCar", order);

  /**
   * effect: 查询所有用户
   * method: get
   */
  app.get("/allUsers", function (req, res) {
    // 向数据库请求所有数据并返回
    userModel.find(function (error, result) {
      if (!error) {
        res.json({
          message: "查询成功",
          data: result
        });
      } else {
        res.json({
          message: "查询失败",
          data: error
        });
      }
    });
  });

  /**
   * effect: 注册新用户
   * method: post
   */

  app.post("/register", (req, res) => {
    console.log(req.body);
    const { nickname, username, password } = req.body;
    // 注册的时候，账号、昵称唯一
    userModel.find({ username }, (error, result) => {
      if (!error) {
        if (result.length !== 0) {
          // 可以查询到，说明已经注册过了。
          res.json({
            code: 3,
            message: "该账号已经注册，请前往登录"
          });
        } else {
          userModel.find({ nickname }, (error, result) => {
            if (!error) {
              if (result.length !== 0) {
                // 可以查询到，说明已经昵称占用了。
                res.json({
                  code: 4,
                  message: "该昵称已被占用，请重新选择昵称"
                });
              } else {
                // 查询不到，说明没有注册过，可以进行注册
                userModel.create({
                  nickname,
                  username,
                  password,
                  rank: 2
                }, (errc, resc) => {
                  if (!errc) {
                    res.json({
                      code: 1,
                      message: "注册成功",
                      data: resc.data
                    })
                  } else {
                    res.json({
                      code: 2,
                      message: "注册失败",
                      data: errc
                    })
                  }
                })
              }
            } else {
              res.json({
                code: 0,
                message: "查询失败",
                data: error
              });
            }
          })
        }
      } else {
        res.json({
          code: 0,
          message: "查询失败",
          data: error
        });
      }
    })
  })

  /**
   * effect: 登录
   * method: post
   */
  app.post("/login", (req, res) => {
    const { username, password } = req.body;
    userModel.find({ username: username }, (error, result) => {
      if (!error) {
        // 查询成功，对比密码
        if (result.length !== 0) {
          // 能查询到结果
          if (result[0].password === password) {
            res.json({
              code: 1,
              message: "登录成功",
              rank: result[0].rank,
              id: result[0]._id,
              nickname: result[0].nickname,
              username: result[0].username
            });
          } else {
            res.json({
              code: 2,
              message: "账号或密码不正确"
            })
          }
        } else {
          // 查询不到结果
          res.json({
            code: 3,
            message: "账号未注册"
          })
        }
      } else {
        result.json({
          code: 0,
          message: "查询失败",
          data: error
        });
      }
    })
  })

  // app.get("/myFoods", function (req, res) {
  //   const { userId, shopId } = req.query;
  //   // 向数据库请求所有数据并返回
  //   myModel.find({userId: userId, shopId: shopId},function (error, result) {
  //     console.log(result)
  //     if (!error) {
  //       res.json({
  //         code: 1,
  //         message: "查询成功---购物车",
  //         foods: result.length > 0 ? result[0].foods : []
  //       });
  //     } else {
  //       res.json({
  //         code: 0,
  //         message: "查询失败---购物车",
  //         data: error
  //       });
  //     }
  //   });
  // });

  // // 查询订单
  // app.get("/myOrders", function (req, res) {
  //   const { userId } = req.query;
  //   // 向数据库请求所有数据并返回
  //   myModel2.find({userId: userId },function (error, result) {
  //     // console.log(result)
  //     if (!error) {
  //       res.json({
  //         code: 1,
  //         message: "查询成功---订单",
  //         foods: result.length > 0 ? result : []
  //       });
  //     } else {
  //       res.json({
  //         code: 0,
  //         message: "查询失败---订单",
  //         data: error
  //       });
  //     }
  //   });
  // });

  // // 添加订单
  // app.post("/addOrder", (req, res) => {
  //   const { userId, shopId, date, foods, shopName, shopImg, float_delivery_fee, address } = req.body;
  //   myModel2.create({
  //     userId: userId,
  //     shopId: shopId,
  //     date: date,
  //     shopName: shopName,
  //     shopImg: shopImg,
  //     float_delivery_fee: float_delivery_fee,
  //     address: address,
  //     foods: foods
  //   }, function (error, result) {
  //     if (!error) {
  //       res.json({
  //         message: "添加成功",
  //         data: result.data
  //       });
  //     } else {
  //       res.json({
  //         message: "添加失败",
  //         data: error
  //       });
  //     }
  //   })
  // });

  // app.post("/addFood", function (req, res) {
  //   // console.log(req.body)
  //   const { userId, shopId, foods } = req.body;
  //   // console.log(userId, shopId, foods)
  //   myModel.find({ userId: userId, shopId: shopId }, function (error, result) {
  //     if (!error) {
  //       // 没有错误，说明能够查找到，能查找到就进行操作
  //       if (result.length != 0) {
  //         // 长度不为0，说明有数据，为修改操作
  //         myModel.updateOne({ userId: userId, shopId: shopId }, { $set: { foods: foods } }, (error, result) => {
  //           if (error) {
  //             res.json({ status: 0, msg: "修改失败", foods });
  //           } else {
  //             res.json({ status: 1, msg: "修改成功", foods }); // 把要修改的值再传递回去
  //           }
  //         });
  //       } else {
  //         // 长度为0，说明没有结果，那么应该是添加操作
  //         myModel.create({
  //           userId: userId,
  //           shopId: shopId,
  //           foods: foods
  //         }, function (error, result) {
  //           if (!error) {
  //             res.json({
  //               message: "添加成功",
  //               data: result
  //             });
  //           } else {
  //             res.json({
  //               message: "添加失败",
  //               data: error
  //             });
  //           }
  //         })
  //       }
  //     } else {
  //       // 有错误，说明查找不到
  //       res.json({
  //         message: "查询失败，id有误",
  //         data: error
  //       });
  //     }
  //   });
  // });

  // app.post("/delFood", (req, res) => {
  //   const { userId, shopId } = req.body;
  //   myModel.deleteOne({ userId: userId, shopId: shopId }, (error, result) => {
  //     if (error) {
  //       res.json({ status: 0, msg: "删除失败" });
  //     } else {
  //       res.json({ status: 1, msg: "删除成功" });
  //     }
  //   });
  // });
});


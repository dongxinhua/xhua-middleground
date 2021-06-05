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
    },
    sex: {
      type: Number
    },
    age: {
      type: Number
    }
  }, { collection: "user", versionKey: false });

  const phoneGrade = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    CPU: {
      type: Number,
      required: true
    },
    GPU: {
      type: Number,
      required: true
    },
    MEM: {
      type: Number,
      required: true
    },
    UX: {
      type: Number,
      required: true
    },
    grade: {
      type: Number
    }
  }, { collection: "phoneGrade", versionKey: false });

  const phoneSocGrade = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    CPU: {
      type: Number,
      required: true
    },
    GPU: {
      type: Number,
      required: true
    },
    grade: {
      type: Number
    }
  }, { collection: "phoneSocGrade", versionKey: false });

  const information = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    content: {
      type: Array,
      required: true
    },
    flag: {
      type: Number,
      required: true
    }
  }, { collection: "information", versionKey: false });

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
  const phoneGradeModel = mongoose.model("phoneGrade", phoneGrade);
  const phoneSocGradeModel = mongoose.model("phoneSocGrade", phoneSocGrade);
  const informationModel = mongoose.model("information", information);
  // const myModel2 = mongoose.model("ordersCar", order);

  /**
   * effect: 获取数据对比指标
   * method: get
   */

  app.get("/getIndex", function (req, res) {
    const { type } = req.query;
    if (type === "phone") {
      res.json({
        message: "查询成功",
        data: ["CPU", "GPU", "MEM", "UX"]
      })
    } else if (type === "chip") {
      res.json({
        message: "查询成功",
        data: ["CPU", "GPU"]
      })
    }
  })

  /**
   * effect: 获取对比名称
   * method: get
   */

  app.get("/getContrastArr", function (req, res) {
    const { name } = req.query;
    const arr = [];

    if (name === "phone") {
      phoneGradeModel.find((error, result) => {
        result.forEach(item => {
          arr.push(item.name);
        })

        if (!error) {
          res.json({
            message: "查询成功",
            data: arr
          })
        } else {
          res.json({
            message: "查询失败",
            data: error
          });
        }

        // console.log(result);
      })
    } else if (name === "chip") {
      phoneSocGradeModel.find((error, result) => {
        result.forEach(item => {
          arr.push(item.name);
        })

        if (!error) {
          res.json({
            message: "查询成功",
            data: arr
          })
        } else {
          res.json({
            message: "查询失败",
            data: error
          });
        }

        // console.log(result);
      })
    }
  })

  /**
   * effect: 查询所有用户
   * method: get
   */
  app.get("/allUsers", function (req, res) {
    // 向数据库请求所有数据并返回
    userModel.find(function (error, result) {
      const dataArr = [];
      let num = 0;
      result.sort((a, b) => a.rank - b.rank)
      for (let i = 0; i < result.length; i++) {
        let theData = result[i];
        const { username, nickname, rank } = theData;
        const obj = {
          username,
          nickname,
          rank: rank === 0 ? "站长" : (rank === 1 ? "管理员" : "普通用户"),
          key: num++
        }
        dataArr.push(obj);
      }

      if (!error) {
        res.json({
          message: "查询成功",
          data: dataArr
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
   * effect: 设置管理员
   * method: get
   */
  app.get("/empower", (req, res) => {
    const { username } = req.query;
    userModel.updateOne({ username }, { $set: { rank: 1 } }, (error, result) => {
      if (!error) {
        userModel.find((error, result) => {
          if (!error) {
            result.sort((a, b) => a.rank - b.rank);
            const dataArr = [];
            let num = 0;
            for (let i = 0; i < result.length; i++) {
              let theData = result[i];
              const { username, nickname, rank } = theData;
              const obj = {
                username,
                nickname,
                rank: rank === 0 ? "站长" : (rank === 1 ? "管理员" : "普通用户"),
                key: num++
              }
              dataArr.push(obj);
            }
            res.json({
              code: 1,
              message: "修改成功",
              data: dataArr
            })
          }
        })

      } else {
        res.json({
          code: -1,
          message: "接口出现问题"
        })
      }
    })
  })

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
                  rank: 2,
                  sex: null,
                  age: null
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
              username: result[0].username,
              sex: result[0].sex,
              age: result[0].age
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
  });

  /**
   * effect: 获取手机排行
   * method: get
   */
  app.get("/phoneGrade", (req, res) => {
    phoneGradeModel.find((error, result) => {
      let dataArr = [];
      if (!error) {
        // 对 result 从大到小排序
        result.sort((a, b) => b.grade - a.grade);

        // 条形图数据处理
        for (let i = 0; i < result.length; i++) {
          let data = result[i];
          const { name, CPU, GPU, MEM, UX } = data;
          const obj1 = {
            name,
            type: "CPU",
            value: CPU
          }
          const obj2 = {
            name,
            type: "GPU",
            value: GPU
          }
          const obj3 = {
            name,
            type: "MEM",
            value: MEM
          }
          const obj4 = {
            name,
            type: "UX",
            value: UX
          }
          dataArr.push(obj1);
          dataArr.push(obj2);
          dataArr.push(obj3);
          dataArr.push(obj4);
        }
        res.json({
          code: 1,
          message: "查询成功",
          data: dataArr
        })
      } else {
        res.json({
          code: 0,
          message: "查询失败",
          data: error
        })
      }
    })
  });

  /**
   * effect: 获取手机排行--管理
   * method: get
   */
  app.get("/phoneGradeEdit", (req, res) => {
    phoneGradeModel.find((error, result) => {
      let dataArr = [];
      if (!error) {
        // 对 result 从大到小排序
        result.sort((a, b) => b.grade - a.grade);
        let num = 0;

        // 条形图数据处理
        for (let i = 0; i < result.length; i++) {
          let data = result[i];
          const { name, CPU, GPU, MEM, UX, grade } = data;
          const obj = {
            key: num++,
            name,
            CPU,
            GPU,
            MEM,
            UX,
            grade
          }
          dataArr.push(obj);
        }
        res.json({
          code: 1,
          message: "查询成功",
          data: dataArr
        })
      } else {
        res.json({
          code: 0,
          message: "查询失败",
          data: error
        })
      }
    })
  });

  /**
   * effect: 获取手机芯片数据
   * method: get
   */
  app.get("/phoneSocGrade", (req, res) => {
    phoneSocGradeModel.find((error, result) => {
      let dataArr = [];
      if (!error) {
        result.sort((a, b) => b.grade - a.grade);

        for (let i = 0; i < result.length; i++) {
          let data = result[i];
          const { name, CPU, GPU } = data;
          const obj1 = {
            name,
            type: "CPU",
            value: CPU
          }
          const obj2 = {
            name,
            type: "GPU",
            value: GPU
          }
          dataArr.push(obj1);
          dataArr.push(obj2);
        }

        res.json({
          code: 1,
          message: "查询成功",
          data: dataArr
        });
      } else {
        res.json({
          code: 0,
          message: "查询失败",
          data: error
        })
      }
    })
  })

  /**
   * effect: 获取手机芯片数据---管理
   * method: get
   */
  app.get("/phoneSocGradeEdit", (req, res) => {
    phoneSocGradeModel.find((error, result) => {
      let dataArr = [];
      let num = 0;
      if (!error) {
        result.sort((a, b) => b.grade - a.grade);

        for (let i = 0; i < result.length; i++) {
          let data = result[i];
          const { name, CPU, GPU, grade } = data;
          const obj = {
            key: num++,
            name,
            CPU,
            GPU,
            grade
          }
          dataArr.push(obj);
        }

        res.json({
          code: 1,
          message: "查询成功",
          data: dataArr
        });
      } else {
        res.json({
          code: 0,
          message: "查询失败",
          data: error
        })
      }
    })
  })

  /**
   * 修改手机排行数据
   * method: post
   */

  app.post("/phoneGradeEdit", (req, res) => {
    const { CPU, GPU, MEM, UX, grade, name } = req.body;
    phoneGradeModel.updateOne({ name }, { $set: { CPU, GPU, MEM, UX, grade } }, (error, result) => {
      if (!error) {
        phoneGradeModel.find((error, result) => {
          if (!error) {
            res.json({
              code: 1,
              message: "修改成功",
              data: result
            })
          }
        })
      } else {
        res.json({
          code: -1,
          message: "接口出现问题"
        })
      }
    })

  })

  /**
   * 修改芯片排行数据
   * method: post
   */

  app.post("/socGradeEdit", (req, res) => {
    const { CPU, GPU, grade, name } = req.body;
    phoneSocGradeModel.updateOne({ name }, { $set: { CPU, GPU, grade } }, (error, result) => {
      if (!error) {
        phoneSocGradeModel.find((error, result) => {
          if (!error) {
            res.json({
              code: 1,
              message: "修改成功",
              data: result
            })
          }
        })
      } else {
        res.json({
          code: -1,
          message: "接口出现问题"
        })
      }
    })

  });



  /**
   * effect: 添加手机数据
   * method: post
   */
  app.post("/addPhoneData", (req, res) => {
    const { name, CPU, GPU, MEM, UX, grade } = req.body;
    phoneGradeModel.find({ name }, (error, result) => {
      if (!error) {
        if (result.length !== 0) {
          // 有
          res.json({
            code: 3,
            message: "已存在"
          })
        } else {
          // 没有
          phoneGradeModel.create({ name, CPU, GPU, MEM, UX, grade }, (error, result) => {
            if (!error) {
              res.json({
                code: 1,
                message: "添加成功",
                data: result.data
              })
            } else {
              res.json({
                code: 2,
                message: "添加成功",
                data: error
              })
            }
          })
        }
      } else {
        res.json({
          code: -1,
          message: "接口出现问题"
        })
      }
    })
  })

  /**
   * effect: 添加芯片数据
   * method: post
   */
  app.post("/addSocData", (req, res) => {
    const { name, CPU, GPU, grade } = req.body;
    phoneSocGradeModel.find({ name }, (error, result) => {
      if (!error) {
        if (result.length !== 0) {
          // 有
          res.json({
            code: 3,
            message: "已存在"
          })
        } else {
          // 没有
          phoneSocGradeModel.create({ name, CPU, GPU, grade }, (error, result) => {
            if (!error) {
              res.json({
                code: 1,
                message: "添加成功",
                data: result.data
              })
            } else {
              res.json({
                code: 2,
                message: "添加成功",
                data: error
              })
            }
          })
        }
      } else {
        res.json({
          code: -1,
          message: "接口出现问题"
        })
      }
    })
  })

  /**
   * effect: 删除手机数据
   * method: post
   */
  app.post("/deletePhoneData", (req, res) => {
    const { name } = req.body;
    phoneGradeModel.deleteOne({ name }, (error, result) => {
      if (!error) {
        phoneGradeModel.find((error, result) => {
          if (!error) {
            res.json({
              code: 1,
              data: result
            })
          } else {
            res.json({
              code: 2,
              message: "未找到"
            })
          }
        })
      } else {
        res.json({
          code: -1,
          message: "接口出现错误"
        })
      }
    });
  })

  /**
   * effect: 删除芯片数据
   * method: post
   */
  app.post("/deleteSocData", (req, res) => {
    const { name } = req.body;
    phoneSocGradeModel.deleteOne({ name }, (error, result) => {
      if (!error) {
        phoneSocGradeModel.find((error, result) => {
          if (!error) {
            res.json({
              code: 1,
              data: result
            })
          } else {
            res.json({
              code: 2,
              message: "未找到"
            })
          }
        })
      } else {
        res.json({
          code: -1,
          message: "接口出现错误"
        })
      }
    });
  })


  /**
   * effect: 获取对比数据
   * method: get
   */
  app.post("/getConstrastData", (req, res) => {
    const data = [];
    const data2 = [];
    const { index, contrastArr, type } = req.body;
    if (type === "phone") {
      phoneGradeModel.find((error, result) => {
        if (!error) {
          result.forEach(item => {
            let objData = {
              name: item.name,
              value: item[index]
            }
            data.push(objData);
          })

          contrastArr.forEach(itex => {
            data.forEach(itey => {
              if (itey.name === itex) {
                data2.push(itey);
              }
            })
          })

          res.json({
            message: "查询成功---手机性能",
            data: data2
          })
        } else {
          res.json({
            data: error
          })
        }
      })
    } else if (type === "chip") {
      phoneSocGradeModel.find((error, result) => {
        if (!error) {
          result.forEach(item => {
            let objData = {
              name: item.name,
              value: item[index]
            }
            data.push(objData);
          })

          contrastArr.forEach(itex => {
            data.forEach(itey => {
              if (itey.name === itex) {
                data2.push(itey);
              }
            })
          })

          res.json({
            message: "查询成功---手机芯片",
            data: data2
          })
        }
      })
    }

  })

  /**
   * 修改个人信息
   * method: post
   */

  app.post("/infoChange", (req, res) => {
    const { username, nickname, sex, age } = req.body;
    userModel.updateOne({ username }, { $set: { nickname, sex, age } }, (error, result) => {
      if (!error) {
        userModel.find({ username }, (error, result) => {
          if (!error) {
            res.json({
              status: 1,
              message: "修改成功",
              data: result[0]
            })
          }
        })
      } else {
        res.json({
          status: 0,
          message: "接口出现问题"
        })
      }
    })
  })

  /**
   * 获取个人功能列表
   * method: get
   */

  app.get("/getFuncList", (req, res) => {
    const { rank } = req.query;
    if (rank == 0) {
      res.json({
        code: 0,
        data: [
          {
            id: 0,
            name: "基本信息"
          },
          {
            id: 1,
            name: "修改信息"
          },
          {
            id: 2,
            name: "数据管理"
          },
          {
            id: 3,
            name: "管理授予"
          }
        ]
      })
    } else if (rank == 1) {
      res.json({
        code: 1,
        data: [
          {
            id: 0,
            name: "基本信息"
          },
          {
            id: 1,
            name: "修改信息"
          },
          {
            id: 2,
            name: "数据管理"
          }
        ]
      })
    } else {
      res.json({
        code: 2,
        data: [
          {
            id: 0,
            name: "基本信息"
          },
          {
            id: 1,
            name: "修改信息"
          }
        ]
      })
    }
  })

  /**
   * effect: 获取所有资讯
   * method: get
   */

  app.get("/getInformation", (req, res) => {
    const { flag } = req.query;

    informationModel.find({flag}, (error, result) => {
      if (!error) {
        res.json({
          code: 1,
          message: "查找成功",
          data: result[0]
        })
      } else {
        res.json({
          code: -1,
          message: "接口错误",
          data: error
        })
      }
    })

  })

    /**
     * 插入数据
     */

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


import { UserModel } from "../Models/UserModel.js";
import { MessageModel } from "../Models/MessageModel.js";

export const getDashboardData = async(req,res)=>{

try{

const users=
await UserModel.countDocuments();

const totalMessages=
await MessageModel.countDocuments();

const today=
new Date();

today.setHours(
0,
0,
0,
0
);

const todayMessages=
await MessageModel.countDocuments({

createdAt:{
$gte:today
}

});


const messages=
await MessageModel.find()
.sort({
createdAt:-1
})
.limit(20);


const summary=
messages
.map(
m=>m.content
)
.filter(
x=>x &&
!x.includes("http")
)
.slice(0,5)
.join(". ");


const activity=[];

for(let i=6;i>=0;i--){

let day=
new Date();

day.setDate(
day.getDate()-i
);

let next=
new Date(day);

next.setDate(
next.getDate()+1
);

const count=
await MessageModel.countDocuments({

createdAt:{

$gte:day,
$lt:next

}

});

activity.push({

day:
day.toLocaleDateString(
"en-US",
{
weekday:"short"
}
),

count

});

}


res.json({

stats:{

users,
totalMessages,
todayMessages

},

summary:{

missedMessages:
messages.length,

summaryText:
summary

},

activity

});

}
catch(err){

res.status(500)
.json({
message:err.message
});

}

};
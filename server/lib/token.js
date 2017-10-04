import jwt from 'jsonwebtoken'

export default function(userId) {
  const token = jwt.sign({
        userId
    }, 'yaojun', {
        expiresIn: '10h' //过期时间设置为60妙。那么decode这个token的时候得到的过期时间为 : 创建token的时间 +　设置的值
    });
    return token;
}

export default function ({ store, route, redirect }) {
  if (!store.state.authUser) {
    let { fullPath } = route
    fullPath = encodeURIComponent(fullPath.substr(1))
    console.log(route)
    return redirect(`/wechat-redirect?visit=${fullPath}`)
  }
}

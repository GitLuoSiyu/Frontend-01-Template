# 每周总结可以写在这里

## App Clip 应用剪影
本周winter老师主要讲解了JSX语法和react相关的知识，包括封装了一个 轮播组件，还补了一节写作课。不过本周我想记录的是一项正在学习的技能。

6 月22日，苹果在其年度全球开发者大会（WWDC）上，宣布了新款 iOS 14 的应用剪辑功能（App Clip）。应用程序剪辑，是允许用户快速预览应用程序的一个“半屏裤衩”页面，而无需下载它们。

它给人的感觉就像是美国版的小程序。

>官网是这么描述的:扫描一个二维码，一个专用的应用程序剪辑码、或 NFC 标签时、或者单击一个Safari启动条、或者从短信中单击链接、或者从地图Map中单击一个锚点时。你的 iPhone 将启动应用程序剪辑卡。你可以点击打开并启动应用剪辑，而不下载它。应用程序剪辑与苹果支付、苹果登录无缝兼容。这意味着你不需要在应用程序上建立账户或者使用你的信用卡信息。用户可以用它支付外卖或停车费，还可以进一步了解更多信息。

所以可以间接把它理解为“苹果小程序码”。

一个小于 10MB 的 App 软件包，并不是不需要下载，而是苹果在后台默默给你下载好了。如果不是网络环境变好了，根据不太可能做到几秒内加载并启动。

让使用 2g 网络的非州兄弟用用，看能不能在几秒内点开。当然，非州兄弟也不使用苹果手机，据说用华为手机的更多一些。

可以把这个应用剪辑（App Clip），看作是一个内嵌于苹果手机这个大应用中的一个页面，可以通过一个链接（虽然可以扫码启动，可以通过NFC启动，本质上还是一个链接）启动。启动的时候，其实是从苹果服务器上，下载了这个页面。

并且估计做了缓存，下次打开同样的应用剪辑时，就不需要重复下载了。当然这里面不知道苹果有没有抄袭微信小程序冷启动、热切换机制。是每次都检查新版本，还是只有冷启动时才检查应用剪辑的新版本呢？

在微信小程序刚要上线时，听说“应用号”这个名称，因为被苹果婉拒而生生改成了小程序。是不是那个时候，苹果已经开始谋划这个“应用剪辑”的功能了呢？三年磨一剑，这确实符合苹果的风格。

### 如何开发AppClip
首先，能不能用 js/css 开发它？

没戏。至少目前没戏，以后有了第三方类库或工具或许可能吧。关于如何开发，这里有一个官方介绍：https://developer.apple.com/documentation/app_clips/creating_an_app_clip。这篇文档大意是讲，应用剪辑的开发和普通App的开发是类似的，只需要将 Xcode 升级到 12 beta 版本就可以了。并且官方建议我们，和 App 使用同样的一套代码。只是在原项目上多创建一个编译目标。苹果把本来是一个 App 的内容，现在重构一个手机内页面，并且执行包估计也是二进制形式的，确实旗高一筹。这大概就是手握软硬件，控制上下游的好处吧。如果微信有一部自己的手机，可能微信小程序也这么干了。

### 实现方式：native 代码、native 框架、native app 一样的分发
在实现上，AppClip 和原生的 app 使用一样的方式。在 UI 框架上同时支持 UIKit 和 SwiftUI，有些开发者认为只能使用 SwiftUI 开发，这点是错误的。AppClip 的定位和 watch app、app extension 类似，和 app 在同一个 project 里，是一个单独的 target。只是 AppClip 并没有自己的专属 framework（其实有一个，但是主要包含的是一些特色 api），使用的框架和 app 一致，可以认为是一个精简版的原生 App。

AppClip 不能单独发布，必须关联一个 app。因此发布的流程和 app 和一样的，在 apple connect 上创建一个版本，和 app 一起提交审核。和 app 在技术上的最大区别只是大小限制在 10MB 以内，因为 AppClip 的基础就是希望用户可以最迅速的被用户使用，如果体积大了就失去了产品的根本。

### 产品定位：用完即走
AppClip 的定位和小程序的初衷一样，用完即走，不过多占用用户的内存空间。尤其是微信小程序在国内已经完全普及了，微信小程序初始发布的时候也被苹果加了多条限制。其中一条就是小程序不能有虚拟商品支付功能。现在回头看苹果自己的 AppClip 可以完美支持 apple pay，很难说苹果没有私心(借鉴小程序?)。


AppClip 使用一段 URL 标识自己，格式遵从 universal link。因为苹果对 Clip 的使用场景非常明确，所以在 Clip 的调起方式做了严格限制。Clip 的调用只能是用户主动要发起才能访问，所以不存在用户在某个 app 里不小心点了一个按钮，就跳转下载了 Clip。


再次总结一下 Clip 的入口限制：只能是用户主动发起才能访问。虽然 Clip 的入口是一段 universal link，在代码里的处理方式也和 universal link 一致，但是为了 Clip 不被滥用，Clip 的调起只能是操作系统调起。App 没有能力主动调起一个 Clip 程序。


### 无需安装、卸载

因为 Clip 的大小被限制在了 10MB 以下，在当下的网络状态下，可以实现快速的打开。为了给用户使用非常轻松的感觉，在 UI 上不会体现“安装”这样的字眼，而是直接“打开”。预期的场景下用户打开 Clip 和打开一个网页类似。因此在用户的视角里就不存在软件的安装、卸载。

Clip 的生命周期由操作系统全权接管。如果 Clip 用户一段时间后没有使用，操作系统就会自动清除掉 Clip，Clip 里存储的数据也会被一并清除。因此虽然 Clip 提供了存储的能力，但是程序不应该依赖存储的数据，只能把存储当做 cache 来使用，操作系统可能自动清除缓存的数据。


### 横向比较：PWA、Instant Apps、小程序

#### Instant Apps
18 年正式发布的 Android Instant apps 和 Clip 在技术上是最接近的。Instant apps 中文被翻成“免安装应用”，在体验上也是希望用户能够最低成本的使用上 app，让用户感受不到安装这个步骤。Instant apps 也可以通过 url 标识（deep link），如果在 chrome 里搜索到应用的网站，chrome 如果识别到域名下有关联应用，可以直接“打开”。消息中的链接也可以被识别。只是 Instant apps 发布的早，国外用户也没有使用二维码的习惯，所以入口上不支持二维码、NFC。

两者的根本区别还是在定位上，Instant apps 提出的场景是提供一个 app 的试用版。因此场景是你已经到了 app 的下载页面，这个时候如果一个 app 几百兆你可能就放弃下载了，但是有一个极简的试用版，就会提高你使用 app 的可能。这个场景在游戏 app 里尤其明显，一方面高质量的游戏 app 体积比较大。另一方面，如果是一个付费下载的应用，如果有一个免费的试用版，也可以增加用户的下载可能。在苹果生态里很多应用会提供一个受限的免费 lite 版本也是一样的需求。

但是 Instant apps 在国内没有产生任何影响。因为政策的原因，Google Play 不支持在国内市场使用。国内的安卓应用市场也是鱼龙混杂，对于 Instant apps 也估计也没有统一支持。另外国内的安卓生态也和欧美地区区别比较大，早期安卓市场上收费的应用很少，对于用户而言需要试用免费 app 的场景很少。另外大厂也可能会推出专门的急速版应用，安装后利用动态化技术下发代码，应用体积也可以控制在 10 MB 以内。

Clip 则是非常明确的面向线下提供服务的场景，在应用能力上可以接入 sign in with apple，apple pay。这样一个全新的用户，可以很快速的使用线下服务并且进行注册、支付。用户体验会好的多。安卓因为国内生态的原因，各个安卓厂商没有统一的新用户可以快速注册的接口，也没有统一的支付接口，很难提供相匹敌的体验。如果开发者针对各个厂商单独开发，那成本上就不是“小程序”了。

#### Progressive Web App(PWA)
Progressive Web App 是基于 web 的技术。在移动互联网兴起之后，大家的流量都转移到了移动设备上。然而在移动上的 web 体验并不好。于是 W3C 和谷歌就基于浏览器的能力，制定了一套协议，让 web app 可以拥有更多的 native 能力。

>PWA 不是特指某一项技术，而是应用了多项技术的 Web App。其核心技术包括 App Manifest、Service Worker、Web Push。

PWA 相当于把小程序里的代码直接下载到了本地，有了独立的 app 入口。运行的时候基于浏览器的能力。但是对于用户感受和原生 app 一样。

我个人对 PWA 技术很有好感，它的初衷有着初代互联网般的美好。希望底层有一套协议后，用户体验还是没有边界的互联网。然而时代已经变了。PWA 在中国基本上是凉了。

PWA 从出生就带了硬伤，虽然谷歌希望有一套 web 标准可以运行在移动设备上，但是对于苹果的商业策略而言，这并不重要。因此 PWA 的一个协议，从制定出来，再到移动设备（iOS）上支持这个特性，几年就过去了。而且对于移动用户而言，可以拥有一个美好的 web app 并不是他们的痛点。

总结起来 PWA 看着美好，但似乎更多是对于 web 开发者心中的美好愿景。在落实中遇到了很多现实的问题，技术支持的不好，开发者就更没有动力在这个技术上做软件生态了。


#### 对比原生 app 的技术限制
虽然 Clip 可以直接使用 iOS framework，但是因为 Clip 的使用场景是新用户的初次、简短、当下（in-the-moment experience）的使用，相比原生 app 苹果还是进行了一些限制。
App 不能访问用户的隐私信息：

- 运动和健身数据
- Apple Music 和多媒体文件
- 通讯录、信息、照片、文件等数据

不过为了能够提供给用户更加轻便的体验，通过专门为 Clip 设计了免申请的通知、定位权限。不过也有限制：免申请的通知只在 8 个小时内有效。位置只能获取一次。如果 app 需要重度使用这两类权限就还是和原来一样，可以弹窗申请。

某些高级应用能力也会受限，需要在完整的应用中才能使用：

- 不能请求追踪授权
- 不能进行后台请求任务
- 没在激活状态蓝牙连接会断开

总的而言虽然有一些限制，但是这些限制的出发点是希望开发者关注 Clip 的正确使用场景。对于 Clip 所提倡的使用场景里，苹果提供的能力是完全够用的。

#### 微信小程序
前面提过在产品理念上小程序和 Clip 很相似，甚至说不定 Clip 是受了小程序的启发。在市场上，小程序是 Clip 的真正对手。

小程序基于微信的 app，Clip 基于操作系统，因此在能力上 Clip 有优势。小程序的入口需要先打开微信，而 Clip 可以通过 NFC 靠近直接激活应用。对于开发者而言，Clip 可以直接获得很多原生的能力（比如 push），如果用户喜欢可以关联下载自己的原生应用。在小程序中，微信出于商业原因开发者不能直接跳转到自有 app，小程序的能力也依赖于微信提供的接口。

不过如果开发者没有自己的独立 app，那么也就只能选择小程序了。小程序发展到现在场景也比最早提出的线下服务更加多了，反而类似 Instant apps，更像一个轻量级的 app。

考虑到国内很多小程序的厂商都没有自己的独立 app，因此 clip 对于这部分群体也并没有什么吸引力。不过对于线下服务类，尤其有支付场景的，Clip 在用户体验上会比小程序好一些。

总结，Clip 的业务场景和小程序有一小部分是重叠的，小程序覆盖的场景还是更多一些。两者在大部分时候并不是互斥式的竞争关系，即便在一些场景下 Clip 有技术优势，商家也不会放弃小程序，因为还有安卓用户嘛。还是看商家在某些场景里，是否愿意为用户多提供一种更好的交互方式。

>截至2020年7月16日，目前微信针对小程序开放了2个新功能：①增加微信小程序分享朋友圈；②增加H5跳转微信小程序。

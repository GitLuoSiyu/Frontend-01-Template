import { createElement, Text, Wrapper } from "./createElement";

import {Carousel} from "./carousel.view";

// class MyComponent {
//     // 只有一次设置
//     constructor(config) {
//         this.children = [];
//     }

//     setAttribute(name, value) {  // attribute 
//         this.root.setAttribute(name, value);
//     }

//     appendChild(child) {  // children 
//         this.children.push(child);
//     }

//     render() {
//         return <article>
//             <header>I'm a header</header>
//             {this.slot}
//             <footer>I'm a footer</footer>
//         </article>
//     }

//     mountTo(parent) {
//         this.slot = <div></div>
//         for (let child of this.children) { 
//             this.slot.appendChild(child)
//         }
//         this.render().mountTo(parent)
//     }
// }


// class Carousel {
//     // 只有一次设置
//     constructor(config) {
//         this.children = [];
//         this.attributes = new Map();
//         this.properties = new Map();
//     }

//     setAttribute(name, value) {  // attribute 
//         // this.root.setAttribute(name, value);
//         this[name] = value;
//     }

//     appendChild(child) {  // children 
//         this.children.push(child);
//     }

//     render() {
//         let children = this.data.map(url => {
//             let element = <img src={url} />;
//             element.addEventListener("dragstart", event => event.preventDefault())
//             return element;
//         })

//         let root = <div class="carousel">
//             {children}
//         </div>

//         let position = 0;
//         let nextPic = () => {
//             let nextPosition = (position + 1) % this.data.length;
//             let current = children[position];
//             let next = children[nextPosition];

//             current.style.transition = "ease 0s";
//             next.style.transition = "ease 0s";

//             current.style.transform = `translateX(${- 100 * position}%)`
//             next.style.transform = `translateX(${100 - 100 * nextPosition}%)`

//             setTimeout(function () {
//                 // current.style.transition = "ease 0s";
//                 // next.style.transition = "ease 0s";
//                 current.style.transition = ""; // "" means use css rule
//                 next.style.transition = "";

//                 current.style.transform = `translateX(${-100 - 100 * position}%)`
//                 next.style.transform = `translateX(${- 100 * nextPosition}%)`
//                 position = nextPosition;
//             }, 16)

//             setTimeout(nextPic, 3000);
//         }
//         setTimeout(nextPic, 3000);

//         return root;
//     }


//     mountTo(parent) {
//         this.render().mountTo(parent)
//     }
// }

let component = <Carousel data={[
    "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
    "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
    "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
    "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
]} />


// let component = <MyComponent>
//     <div>text text text</div>
// </MyComponent>;
// let component = <div>{new Wrapper("span")}</div>;


{/* <div id="a" cls="b" style="width:100px;height:100px;background-color:pink;">
    <div>ext text tex</div> 
    <div>{1}</div>
    <div>{new Wrapper("span")}</div>
</div> */}

// component.id = "c";
// console.log(component);
component.mountTo(document.body)

// 编译后的代码
// var component = createElement(Parent, {
//     id: "a",
//     "class": "b"
// }, createElement(Child, null),
//     createElement(Child, null),
//     createElement(Child, null));
// console.log(component);

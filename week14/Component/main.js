import { createElement, Text, Wrapper } from "./createElement";

class Carousel {
  constructor(config) {
    this.children = [];
    this.attributes = new Map();
    this.properties = new Map();
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  render() {
    let children = this.data.map(url => {
      let element = <img src={url} />;
      element.addEventListener('dragstart', event => event.preventDefault());
      return element;
    });
    let root = <div class="carousel">
      {children}
    </div>

    let position = 0;
    let nextPic = () => {
      let nextPostion = (position + 1) % this.data.length;
      let currentNode = children[position];
      let nextNode = children[nextPostion];

      currentNode.style.transition = 'ease 0s';
      nextNode.style.transition = 'ease 0s';

      // 起始位置
      currentNode.style.transform = `translateX(${-100 * position}%)`;
      nextNode.style.transform = `translateX(${100 - 100 * nextPostion}%)`;

      setTimeout(() => {
        currentNode.style.transition = 'ease 0.5s';
        nextNode.style.transition = 'ease 0.5s';

        // 终止位置
        currentNode.style.transform = `translateX(${- 100 - 100 * position}%)`;
        nextNode.style.transform = `translateX(${-100 * nextPostion}%)`;

        position = nextPostion;
      }, 16);
      setTimeout(nextPic, 3000);
    }

    // setTimeout(nextPic, 3000);
    root.addEventListener('mousedown', event => {
      let startX = event.clientX;
      let lastPosition = (position - 1 + this.data.length) % this.data.length;
      let nextPosition = (position + 1) % this.data.length;

      let currentNode = children[position];
      let lastNode = children[lastPosition];
      let nextNode = children[nextPosition];

      currentNode.style.transition = 'ease 0s';
      lastNode.style.transition = 'ease 0s';
      nextNode.style.transition = 'ease 0s';

      currentNode.style.transform = `translateX(${-500 * position}px)`;
      lastNode.style.transform = `translateX(${-500 - 500 * lastPosition}px)`;
      nextNode.style.transform = `translateX(${500 - 500 * nextPosition}px)`;


      let move = event => {
        currentNode.style.transition = 'ease 0.5s';
        lastNode.style.transition = 'ease 0.5s';
        nextNode.style.transition = 'ease 0.5s';

        currentNode.style.transform = `translateX(${event.clientX - startX - 500 * position}px)`;
        lastNode.style.transform = `translateX(${event.clientX - startX - 500 - 500 * lastPosition}px)`;
        nextNode.style.transform = `translateX(${event.clientX - startX + 500 - 500 * nextPosition}px)`;
      }

      let up = event => {
        let offset = 0;
        if (event.clientX - startX > 250) { // 大于250下一张
          offset = 1;
        } else if (event.clientX - startX < -250) { // 小于250 回到当前
          offset = -1;
        }

        // 为打开transition 设置为空 为打开transition
        currentNode.style.transition = '';
        lastNode.style.transition = '';
        nextNode.style.transition = '';

        currentNode.style.transform = `translateX(${offset * 500 - 500 * position}px)`;
        lastNode.style.transform = `translateX(${offset * 500 - 500 - 500 * lastPosition}px)`;
        nextNode.style.transform = `translateX(${offset * 500 + 500 - 500 * nextPosition}px)`;

        position = (position - offset + this.data.length) % this.data.length;

        // 移除监听事件
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }

      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });

    return root;
  }

  mountTo(parent) {
    this.render().mountTo(parent)
  }
}

let component = <Carousel data={[
  "https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
  "https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
  "https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
  "https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg",
]}>
</Carousel>

component.mountTo(document.body);
console.log(component);

<!-- # 课堂笔记(个人东西)
```javascript
// 函数柯里化 - currying
function curry(func,args,space) {  
    var n  = func.length - args.length; //arguments still to come  
    var sa = Array.prototype.slice.apply(args); // saved accumulator array  
    function accumulator(moreArgs,sa,n) {  
        var saPrev = sa.slice(0); // to reset  
        var nPrev  = n; // to reset  
        for(var i=0;i<moreArgs.length;i++,n--) {  
            sa[sa.length] = moreArgs[i];  
        }  
        if ((n-moreArgs.length)<=0) {  
            var res = func.apply(space,sa);  
            // reset vars, so curried function can be applied to new params.  
            sa = saPrev;  
            n  = nPrev;  
            return res;  
        } else {  
            return function (){  
                // arguments are params, so closure bussiness is avoided.  
                return accumulator(arguments,sa.slice(0),n);  
            }  
        }  
    }  
    return accumulator([],sa,n);  
}  

// 使用
function add (a,b,c){   
      if (arguments.length < this.add.length) {  
        return curry(this.add,arguments,this);  
      }    
      return a+b+c;  
}  
    
alert(add()(1,2,4));      // 7  
alert(add(1)(2)(5));      // 8  
alert(add(1)()(2)()(6));  // 9  
alert(add(1,2,7,8));      // 10  
``` -->

# 每周总结可以写在这里

## 前言
这一周主要跟随winter老师学习了前端的历史、标准、读ECMA、指定职业规划、工具链、web安全等等知识。

最重要的是摆正我们参与此次训练营的态度，为什么学，怎么学，比如学习的第一步，建立前端的知识体系和自己的知识架构，两份体系进行对比，这样你就知道自己欠缺什么，哪方面过于薄弱，哪方面现如今已经足够了，这样你才能进行下一步的学习。还有，同样的CSS、JS作为一门语言，也有他们语法、词法，也有它们特殊的东西，又例如JS中有运行时，那么什么叫运行时，运行时里有什么？类型除了七大类型外，为什么还有没见过的内部类型，它有什么用？

太多太多，还是整理当中，今天第一次总结，我就先谈一下我自己对于winter老师前3次课里最感兴趣的内容先总结一番。
主题就是：无类语言与JavaScript

## OOP与JavaScript
时间回溯到1月份面试蚂蚁金服的时候，面试官问过我这样一道题，除了JS，你还学习过哪些OOP，怎么理解JS是基于寄存器的而V8是基于栈的，谁更快。

### 1.解析器与解释器
JavaScriptCore从SquirrelFish版开始是“基于寄存器”的，V8则不适合用“基于栈”或者“基于寄存器”的说法来描述。
解析器是parser，而解释器是interpreter。两者不是同一样东西，不应该混用。

前者是编译器/解释器的重要组成部分，也可以用在IDE之类的地方；其主要作用是进行语法分析，提取出句子的结构。广义来说输入一般是程序的源码，输出一般是语法树（syntax tree，也叫parse tree等）或抽象语法树（abstract syntax tree，AST）。进一步剥开来，广义的解析器里一般会有扫描器（scanner，也叫tokenizer或者lexical analyzer，词法分析器），以及狭义的解析器（parser，也叫syntax analyzer，语法分析器）。扫描器的输入一般是文本，经过词法分析，输出是将文本切割为单词的流。狭义的解析器输入是单词的流，经过语法分析，输出是语法树或者精简过的AST。

在一些编译器/解释器中，解析也可能与后续的语义分析、代码生成或解释执行等步骤融合在一起，不一定真的会构造出完整的语法树。但概念上说解析器就是用来抽取句子结构用的，而语法树就是表示句子结构的方式。

其中词法分析由扫描器完成，语法分析由狭义的解析器完成。

后者则是实现程序执行的一种实现方式，与编译器相对。它直接实现程序源码的语义，输入是程序源码，输出则是执行源码得到的计算结果；编译器的输入与解释器相同，而输出是用别的语言实现了输入源码的语义的程序。通常编译器的输入语言比输出语言高级，但不一定；也有输入输出是同种语言的情况，此时编译器很可能主要用于优化代码。
举例：把同样的源码分别输入到编译器与解释器中，得到的输出不同；值得留意的是，编译器生成出来的代码执行后的结果应该跟解释器输出的结果一样——它们都应该实现源码所指定的语义。

### 2."解释器"到底是什么？"解释型语言"呢？
很多资料会说，Python、Ruby、JavaScript都是"解释型语言"，是通过解释器来实现的。这么说其实很容易引起误解：语言一般只会定义其抽象语义，而不会强制性要求采用某种实现方式。

例如说C一般被认为是"编译型语言"，但C的解释器也是存在的，例如Ch。同样，C++也有解释器版本的实现，例如Cint。

一般被称为"解释型语言"的是主流实现为解释器的语言，但并不是说它就无法编译。例如说经常被认为是"解释型语言"的Scheme就有好几种编译器实现，其中率先支持R6RS规范的大部分内容的是Ikarus，支持在x86上编译Scheme；它最终不是生成某种虚拟机的字节码，而是直接生成x86机器码。

解释器就是个黑箱，输入是源码，输出就是输入程序的执行结果，对用户来说中间没有独立的“编译”步骤。这非常抽象，内部是怎么实现的都没关系，只要能实现语义就行。你可以写一个C语言的解释器，里面只是先用普通的C编译器把源码编译为in-memory image，然后直接调用那个image去得到运行结果；用户拿过去，发现直接输入源码可以得到源程序对应的运行结果就满足需求了，无需在意解释器这个“黑箱子”里到底是什么。

实际上很多解释器内部是以“编译器+虚拟机”的方式来实现的，先通过编译器将源码转换为AST或者字节码，然后由虚拟机去完成实际的执行。所谓“解释型语言”并不是不用编译，而只是不需要用户显式去使用编译器得到可执行代码而已。

那么虚拟机（virtual machine，VM）又是什么？在许多不同的场合，VM有着不同的意义。如果上下文是Java、Python这类语言，那么一般指的是高级语言虚拟机（high-level language virtual machine，HLL VM），其意义是实现高级语言的语义。VM既然被称为“机器”，一般认为输入是满足某种指令集架构（instruction set architecture，ISA）的指令序列，中间转换为目标ISA的指令序列并加以执行，输出为程序的执行结果的，就是VM。源与目标ISA可以是同一种，这是所谓same-ISA VM。
前面提到解释器中的编译器的输出可能是AST，也可能是字节码之类的指令序列；一般会把执行后者的程序称为VM，而执行前者的还是笼统称为解释器或者树遍历式解释器（tree-walking interpreter）。这只是种习惯而已，并没有多少确凿的依据。只不过线性（相对于树形）的指令序列看起来更像一般真正机器会执行的指令序列而已。

VM并不是神奇的就能执行代码了，它也得采用某种方式去实现输入程序的语义，并且同样有几种选择：“编译”，例如微软的.NET中的CLR；“解释”，例如CPython、CRuby 1.9，许多老的JavaScript引擎等；也有介于两者之间的混合式，例如Sun的JVM，HotSpot。如果采用编译方式，VM会把输入的指令先转换为某种能被底下的系统直接执行的形式（一般就是native code），然后再执行之；如果采用解释方式，则VM会把输入的指令逐条直接执行。

换个角度说，采用编译和解释方式实现虚拟机最大的区别就在于是否存下目标代码：编译的话会把输入的源程序以某种单位（例如基本块/函数/方法/trace等）翻译生成为目标代码，并存下来（无论是存在内存中还是磁盘上，无所谓），后续执行可以复用之；解释的话则是把源程序中的指令逐条解释，不生成也不存下目标代码，后续执行没有多少可复用的信息。有些稍微先进一点的解释器可能会优化输入的源程序，把满足某些模式的指令序列合并为“超级指令”；这么做就是朝着编译的方向推进。

如果一种语言的主流实现是解释器，其内部是编译器+虚拟机，而虚拟机又是采用解释方式实现的，或者内部实现是编译器+树遍历解释器，那它就是名副其实的“解释型语言”。如果内部用的虚拟机是用编译方式实现的，其实跟普遍印象中的“解释器”还是有所区别。

可以举这样一个例子：AS3 (ActionScript 3)，一般都被认为是“解释型语言”对吧？但这种观点到底是把FlashPlayer整体看成一个解释器，因而AS3是“解释型语言”呢？还是认为FlashPlayer中的虚拟机采用解释执行方案，因而AS3是“解释型语言”呢？
其实Flash或Flex等从AS3生成出来的SWF文件里就包含有AS字节码（ActionScript Byte Code，ABC）。等到FlashPlayer去执行SWF文件，或者说等到AVM2（ActionScript Virtual Machine 2）去执行ABC时，又有解释器和JIT编译器两种实现。这种需要让用户显式进行编译步骤的语言，到底是不是“解释型语言”呢？

一些比较老的解释器，例如CRuby在1.9引入YARV作为新的VM之前的解释器，还有SquirrleFish之前的老JavaScriptCore以及它的前身KJS，它们内部是树遍历式解释器；解释器递归遍历树，树的每个节点的操作依赖于解释其各个子节点返回的值。这种解释器里没有所谓的求值栈，也没有所谓的虚拟寄存器，所以不适合以“基于栈”或“基于寄存器”去描述。

而像V8那样直接编译JavaScript生成机器码，而不通过中间的字节码的中间表示的JavaScript引擎，它内部有虚拟寄存器的概念，但那只是普通native编译器的正常组成部分。我觉得也不应该用“基于栈”或“基于寄存器”去描述它。
V8在内部也用了“求值栈”（在V8里具体叫“表达式栈”）的概念来简化生成代码的过程，在编译过程中进行“抽象解释”，使用所谓“虚拟栈帧”来记录局部变量与求值栈的状态；但在真正生成代码的时候会做窥孔优化，消除冗余的push/pop，将许多对求值栈的操作转变为对寄存器的操作，以此提高代码质量。于是最终生成出来的代码看起来就不像是基于栈的代码了。

### 3.基于栈与基于寄存器架构的VM，用哪个好？
如果是要模拟现有的处理器，那没什么可选的，原本处理器采用了什么架构就只能以它为源。但HLL VM的架构通常可以自由构造，有很大的选择余地。为什么许多主流HLL VM，诸如JVM、CLI、CPython、CRuby 1.9等，都采用了基于栈的架构呢？我觉得这有三个主要原因：

1、实现简单
由于指令中不必显式指定源与目标，VM可以设计得很简单，不必考虑为临时变量分配空间的问题，求值过程中的临时数据存储都让求值栈包办就行。
更新：回帖中cscript指出了这句不太准确，应该是针对基于栈架构的指令集生成代码的编译器更容易实现，而不是VM更容易实现。

2、专一性
该VM是为某类资源非常匮乏的硬件而设计的，这类硬件的存储器可能很小，每一字节的资源都要节省。零地址指令比其它形式的指令更紧凑，所以是个自然的选择。

3、可移植性
处理器的特性各个不同：典型的CISC处理器的通用寄存器数量很少，例如32位的x86就只有8个32位通用寄存器（如果不算EBP和ESP那就是6个，现在一般都算上）；典型的RISC处理器的各种寄存器数量多一些，例如ARM有16个32位通用寄存器，Sun的SPARC在一个寄存器窗口里则有24个通用寄存器（8 in，8 local，8 out）。
假如一个VM采用基于寄存器的架构（它接受的指令集大概就是二地址或者三地址形式的），为了高效执行，一般会希望能把源架构中的寄存器映射到实际机器上寄存器上。但是VM里有些很重要的辅助数据会经常被访问，例如一些VM会保存源指令序列的程序计数器（program counter，PC），为了效率，这些数据也得放在实际机器的寄存器里。如果源架构中寄存器的数量跟实际机器的一样，或者前者比后者更多，那源架构的寄存器就没办法都映射到实际机器的寄存器上；这样VM实现起来比较麻烦，与能够全部映射相比效率也会大打折扣。像Dalvik VM的解释器实现，就是把虚拟寄存器全部映射到栈帧（内存）里的，这跟把局部变量区与操作数栈都映射到内存里的JVM解释器实现相比实际区别不太大。

如果一个VM采用基于栈的架构，则无论在怎样的实际机器上，都很好实现——它的源架构里没有任何通用寄存器，所以实现VM时可以比较自由的分配实际机器的寄存器。于是这样的VM可移植性就比较高。作为优化，基于栈的VM可以用编译方式实现，“求值栈”实际上也可以由编译器映射到寄存器上，减轻数据移动的开销。

至于基于栈与基于寄存器的架构，谁更快？看看现在的实际处理器，大多都是基于寄存器的架构，从侧面反映出它比基于栈的架构更优秀。

而对于VM来说，源架构的求值栈或者寄存器都可能是用实际机器的内存来模拟的，所以性能特性与实际硬件又有点不同。一般认为基于寄存器的架构对VM来说也是更快的，原因是：虽然零地址指令更紧凑，但完成操作需要更多的load/store指令，也意味着更多的指令分派（instruction dispatch）次数与内存访问次数；访问内存是执行速度的一个重要瓶颈，二地址或三地址指令虽然每条指令占的空间较多，但总体来说可以用更少的指令完成操作，指令分派与内存访问次数都较少。

### 4.树遍历解释器
在演示基于栈与基于寄存器的VM的例子前，先回头看看更原始的解释器形式。
前面提到解析器的时候用了i = a + b * c的例子，现在让我们来看看由解析器生成的AST要是交给一个树遍历解释器，会如何被解释执行呢？

[image] 本地work1.gif

这是对AST的后序遍历：假设有一个eval(Node n)函数，用于解释AST上的每个节点；在解释一个节点时如果依赖于子树的操作，则对子节点递归调用eval(Node n)，从这些递归调用的返回值获取需要的值（或副作用）——也就是说子节点都eval好了之后，父节点才能进行自己的eval——典型的后序遍历。
（话说，上图中节点左下角有蓝色标记的说明那是节点的“内在属性”。从属性语法的角度看，如果一个节点的某个属性的值只依赖于自身或子节点，则该属性被称为“综合属性”（synthesized attribute）；如果一个节点的某个属性只依赖于自身、父节点和兄弟节点，则该属性被称为“继承属性”（inherited attribute）。上图中节点右下角的红色标记都只依赖子节点来计算，显然是综合属性。）

SquirrelFish之前的JavaScriptCore、CRuby 1.9之前的CRuby就都是采用这种方式来解释执行的。

### 5.从树遍历解释器进化为基于栈的字节码解释器的前端
如果你看到树形结构与后序遍历，并且知道后缀记法（或者逆波兰记法，reverse Polish notation）的话，那敏锐的你或许已经察觉了：要解释执行AST，可以先通过后序遍历AST生成对应的后缀记法的操作序列，然后再解释执行该操作序列。这样就把树形结构压扁，成为了线性结构。
树遍历解释器对AST的求值其实隐式依赖于调用栈：eval(Node n)的递归调用关系是靠调用栈来维护的。后缀表达式的求值则通常显式依赖于一个栈，在遇到操作数时将其压入栈中，遇到运算时将合适数量的值从栈顶弹出进行运算，再将结果压回到栈上。这种描述看起来眼熟么？没错，后缀记法的求值中的核心数据结构就是前文提到过的“求值栈”（或者叫操作数栈，现在应该更好理解了）。后缀记法也就与基于栈的架构联系了起来：后者可以很方便的执行前者。同理，零地址指令也与树形结构联系了起来：可以通过一个栈方便的把零地址指令序列再转换回到树的形式。
Java字节码与Java源码联系紧密，前者可以看成后者的后缀记法。如果想在JVM上开发一种语义能直接映射到Java上的语言，那么编译器很好写：秘诀就是后序遍历AST。

一个Java编译器的输入是Java源代码，输出是含有Java字节码的.class文件。它里面主要包含扫描器与解析器，语义分析器（包括类型检查器/类型推导器等），代码生成器等几大部分。上图所展示的就是代码生成器的工作。对Java编译器来说，代码生成就到字节码的层次就结束了；而对native编译器来说，这里刚到生成中间表示的部分，接下去是优化与最终的代码生成。

如果你对Python、CRuby 1.9之类有所了解，会发现它们的字节码跟Java字节码在“基于栈”的这一特征上非常相似。其实它们都是由“编译器+VM”构成的，概念上就像是Java编译器与JVM融为一体一般。
从这点看，Java与Python和Ruby可以说是一条船上的。虽说内部具体实现的显著差异使得先进的JVM比简单的JVM快很多，而JVM又普遍比Python和Ruby快很多。

当解释器中用于解释执行的中间代码是树形时，其中能被称为“编译器”的部分基本上就是解析器；中间代码是线性形式（如字节码）时，其中能被称为编译器的部分就包括上述的代码生成器部分，更接近于所谓“完整的编译器”；如果虚拟机是基于寄存器架构的，那么编译器里至少还得有虚拟寄存器分配器，又更接近“完整的编译器”了。

### 6.基于栈与基于寄存器架构的VM
要是拿两个分别实现了基于栈与基于寄存器架构、但没有直接联系的VM来对比，效果或许不会太好。现在恰巧有两者有紧密联系的例子——JVM与Dalvik VM。JVM的字节码主要是零地址形式的，概念上说JVM是基于栈的架构。Google Android平台上的应用程序的主要开发语言是Java，通过其中的Dalvik VM来运行Java程序。为了能正确实现语义，Dalvik VM的许多设计都考虑到与JVM的兼容性；但它却采用了基于寄存器的架构，其字节码主要是二地址/三地址混合形式的，乍一看可能让人纳闷。考虑到Android有明确的目标：面向移动设备，特别是最初要对ARM提供良好的支持。ARM9有16个32位通用寄存器，Dalvik VM的架构也常用16个虚拟寄存器（一样多……没办法把虚拟寄存器全部直接映射到硬件寄存器上了）；这样Dalvik VM就不用太顾虑可移植性的问题，优先考虑在ARM9上以高效的方式实现，发挥基于寄存器架构的优势。
Dalvik VM的主要设计者Dan Bornstein在Google I/O 2008上做过一个关于Dalvik内部实现的演讲；同一演讲也在Google Developer Day 2008 China和Japan等会议上重复过。这个演讲中Dan特别提到了Dalvik VM与JVM在字节码设计上的区别，指出Dalvik VM的字节码可以用更少指令条数、更少内存访问次数来完成操作。

## 最后
Dalvik VM是基于寄存器的，x86也是基于寄存器的，但两者的“寄存器”却相当不同：前者的寄存器是每个方法被调用时都有自己一组私有的，后者的寄存器则是全局的。也就是说，概念上Dalvik VM字节码中不用担心保护寄存器的问题，某个方法在调用了别的方法返回过来后自己的寄存器的值肯定跟调用前一样。而x86程序在调用函数时要考虑清楚calling convention，调用方在调用前要不要保护某些寄存器的当前状态，还是说被调用方会处理好这些问题，麻烦事不少。Dalvik VM这种虚拟寄存器让人想起一些实际处理器的“寄存器窗口”，例如SPARC的Register Windows也是保证每个函数都觉得自己有“私有的一组寄存器”，减轻了在代码里处理寄存器保护的麻烦——扔给硬件和操作系统解决了。IA-64也有寄存器窗口的概念。
（当然，Dalvik VM与x86的“寄存器”一个是虚拟寄存器一个是真实硬件的ISA提供的寄存器，本来也不在一个级别上…上面这段只是讨论寄存器的语义。）

Dalvik的.dex文件在未压缩状态下的体积通常比同等内容的.jar文件在deflate压缩后还要小。但光从字节码看，Java字节码几乎总是比Dalvik的小，那.dex文件的体积是从哪里来减出来的呢？这主要得益与.dex文件对常量池的压缩，一个.dex文件中所有类都共享常量池，使得相同的字符串、相同的数字常量等都只出现一次，自然能大大减小体积。相比之下，.jar文件中每个类都持有自己的常量池，诸如"Ljava/lang/Object;"这种常见的字符串会被重复多次。Sun自己也有进一步压缩JAR的工具，Pack200，对应的标准是JSR 200。它的主要应用场景是作为JAR的网络传输格式，以更高的压缩比来减少文件传输时间。



# WangEditor 富文本编辑器使用说明

## 概述

项目已成功将原有的多个富文本编辑器（TinyMCE、Draft.js、React Quill等）统一替换为 **WangEditor**，这是一个国产的、轻量级的、功能完整的富文本编辑器。

## 优势

1. **国产化**: 完全国产，中文文档和社区支持
2. **轻量级**: 体积小，加载快
3. **功能完整**: 支持图片上传、表格、代码块等常用功能
4. **React友好**: 有专门的React组件
5. **配置简单**: 相比TinyMCE更容易配置
6. **免费开源**: 完全免费，无任何费用

## 组件使用

### 基本用法

```jsx
import WangEditor from './WangEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <WangEditor
      value={content}
      onChange={setContent}
      placeholder="请输入内容..."
      height={300}
    />
  );
}
```

### 参数说明

- `value`: 编辑器内容（HTML字符串）
- `onChange`: 内容变化回调函数
- `height`: 编辑器高度（像素）
- `placeholder`: 占位符文本
- `toolbarConfig`: 工具栏配置（可选）

### 工具栏配置

```jsx
const toolbarConfig = {
  excludeKeys: [
    'group-video',    // 排除视频功能
    'insertTable',    // 排除表格功能
    'codeBlock',      // 排除代码块功能
    'fullScreen'      // 排除全屏功能
  ]
};

<WangEditor
  value={content}
  onChange={setContent}
  toolbarConfig={toolbarConfig}
/>
```

## 功能特性

### 1. 图片上传
- 支持拖拽上传
- 支持粘贴上传
- 自动上传到服务器
- 支持图片预览和编辑

### 2. 文本格式化
- 粗体、斜体、下划线
- 字体大小和颜色
- 对齐方式
- 列表（有序、无序）

### 3. 链接管理
- 插入链接
- 编辑链接
- 移除链接

### 4. 其他功能
- 撤销/重做
- 清除格式
- 全屏编辑（可选）

## 已替换的组件

以下组件已被WangEditor替换：

1. `DraftEditor.js` - Draft.js编辑器
2. `TinyMCEEditor.js` - TinyMCE编辑器
3. `TinyEditor.js` - 简化版TinyMCE
4. `RichTextEditor.js` - 通用富文本编辑器
5. `SimpleEditor.js` - React Quill编辑器
6. `SafeEditor.js` - 安全版编辑器

## 使用位置

WangEditor已在以下位置使用：

1. **PackageManager.js** - 套餐详细说明编辑
2. **FooterManager.js** - 页脚内容编辑（关于我们、公司信息、联系方式）

## 测试

可以使用 `TestWangEditor.js` 组件来测试编辑器功能：

```jsx
import TestWangEditor from './TestWangEditor';

// 在路由中添加测试页面
<Route path="/test-editor" element={<TestWangEditor />} />
```

## 注意事项

1. 编辑器会自动处理HTML内容，无需手动转义
2. 图片上传需要确保后端API正常工作
3. 编辑器高度会自动减去工具栏高度
4. 建议在生产环境中配置适当的图片上传限制

## 依赖包

- `@wangeditor/editor`: 核心编辑器
- `@wangeditor/editor-for-react`: React组件封装

## 相关链接

- [WangEditor官网](https://www.wangeditor.com/)
- [GitHub仓库](https://github.com/wangeditor-team/wangEditor)
- [在线文档](https://www.wangeditor.com/doc/) 
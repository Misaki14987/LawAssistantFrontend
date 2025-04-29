import{ useState,useEffect,useRef } from 'react';
import { 
  FaFolder, 
  FaFolderOpen, 
  FaFile,
  FaChevronRight,
  FaChevronDown,
  FaTimes
} from 'react-icons/fa';
import styles from './model.module.css';
import { getToken } from '../../share/share';
import ReactMarkdown from "react-markdown";
// 类型定义
type TemplateNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TemplateNode[];
  size?: string;
  content?: string;
  lastModified?: string;
  parent_id?: string;
};

// 文件树节点组件
const TreeNode = ({ 
  node,
  level = 0,
  expandedNodes,
  onToggle,
  onSelect 
}: {
  node: TemplateNode;
  level?: number;
  expandedNodes: {id:string,parent_id:string | null}[];
  onToggle: (id: string,parent_id:string | null) => void;
  onSelect: (node: TemplateNode) => void;
}) => {
  const isExpanded = expandedNodes.some(item => item.id === node.id && item.parent_id === node.parent_id);
  return (
    <div className={styles.treeNode}>
      <div 
        className={styles.nodeContent}
        style={{ paddingLeft: `${level * 24}px` }}
        onClick={() => node.type === 'folder' ? onToggle(node.id, node.parent_id || null) : onSelect(node)}
      >
        {node.type === 'folder' && (
          <span className={styles.toggleIcon}>
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        )}
        
        <span className={styles.nodeIcon}>
          {node.type === 'folder' ? (
            isExpanded ? <FaFolderOpen /> : <FaFolder />
          ) : <FaFile />}
        </span>
        
        <span className={styles.nodeName}>
          {node.name}
          {node.type === 'file' && (
            <span className={styles.fileMeta}> · {node.size}</span>
          )}
        </span>
      </div>

      {isExpanded && node.children?.map(child => (
        <TreeNode
          key={child.id}
          node={child}
          level={level + 1}
          expandedNodes={expandedNodes}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

// 模板库主组件
const TemplateLibrary = () => {
  const [expandedNodes, setExpandedNodes] = useState<{id:string,parent_id:string | null}[]>([]);
  const [templateData, setTemplateData] = useState<TemplateNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<TemplateNode | null>(null);
  const [fileContent, setFileContent] = useState<any>(null);
  const previewRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    if (selectedFile) {
      const path =Array.from({ length: 3 }, () => "");
      path[2] = selectedFile.id;
      let cur=1;
      let cur_id: string | null = selectedFile.parent_id ?? null;
      for (let i = expandedNodes.length - 1; i >= 0; i--) {
        const item = expandedNodes[i];
        if (item.id === cur_id) {
          path[cur] = item.id;
          cur_id = item.parent_id;
          cur--;
        }
      }
      let id=0;
      fetch(`/api/template/categories/${path[0]}?subCategoryId=${path[1]}&docTypeId=${path[2]}`,{
        method: 'GET',
        headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${getToken()}`
        },
      }).then(
      response => response.json()).then(data => {
        id=data.data[0].ID;
      }).then(()=>{
        fetch(`/api/template/${id}`,{
          method: 'GET',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${getToken()}`
          },
        }).then(response => response.json()).then(data => {
            console.log(data);
            setFileContent(data);
          }).catch(error => {
            console.error('加载文件内容失败:', error);
            alert('加载文件内容失败，请重试');
          });
      })
    }
  },[selectedFile]);

  useEffect(() => {
    console.log(expandedNodes);
  }, [expandedNodes]);

  const handleCopyContent = async () => {
    try {
      if (previewRef.current) {
        const parsedContent = previewRef.current.textContent || '';
        await navigator.clipboard.writeText(parsedContent);
        alert('内容已成功复制到剪贴板！');
      } else {
        alert('没有可复制的内容，请确保文件已加载。');
      }
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制内容时出错，请重试。');
    }
  };

  useEffect(() => {
    function createTree(data: any[]): TemplateNode[] {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.children ? 'folder' : 'file',
        children: item.children? createTree(item.children) : undefined,
        parent_id: item.parent_id?? null,
      }));
    }
    fetch('/api/template/categories',{
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${getToken()}`
      },
    })
      .then(response => response.json())
      .then(data => {
        setTemplateData(createTree(data.data));
      })
      .catch(error => {
        console.error('加载模板失败:', error);
        alert('加载模板失败，请重试');
      });
  }, []);

  // 处理文件夹展开/折叠
  const handleToggle = (id: string, parent_id: string | null) => {
    setExpandedNodes(prev => {
      const index = prev.findIndex(item => item.id === id);
      if (index !== -1) {
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      } else {
        return [...prev, { id, parent_id }];
      }
    });
  };

  // 显示详情弹窗
  const handleSelectFile = (node: TemplateNode) => {
    setSelectedFile(node);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>法律文书模板库</h2>
      
      <div className={styles.treeContainer}>
        {templateData.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            expandedNodes={expandedNodes}
            onToggle={handleToggle}
            onSelect={handleSelectFile}
          />
        ))}
      {/* <h2 className={styles.header}>我的模板</h2> */}
      </div>
      {/* 详情弹窗 */}
      {selectedFile && (
        <div className={styles.detailModal}>
          <div className={styles.modalHeader}>
            <h3>{fileContent?.template.name}</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedFile(null)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className={styles.modalContent}>
            <div className={styles.fileInfo}>
              <p>最后修改: {fileContent?.template.CreatedAt.slice(0,10)}</p>
            </div>
            
            <div className={styles.previewArea} ref={previewRef}>
              <ReactMarkdown>{fileContent?.markdown}</ReactMarkdown>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.copyButton} onClick={handleCopyContent}>
                复制内容
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;
import { useState, useEffect, useRef } from "react";
import Style from "./index.module.css";
import CustomComponent from "./mene.tsx";
import { FaSearch } from "react-icons/fa";
import { BiChevronRight } from "react-icons/bi";
import { LuDownload } from "react-icons/lu";
import { Link, useNavigate } from "react-router";
import AdBanner from "../tuisong/tuisong.tsx";
import TemplateLibrary from "../model/model.tsx";
type Headers = {
  id: number;
  content: string;
  pick: boolean;
};

type SecrchData = {
  id: number;
  title: string;
  time: string;
  type: string;
};

type response = {
  total: number;
  array: SecrchData[];
};

type Path = {
  id: number;
  path: string;
  content: string;
  check: boolean;
};

type HeadersProps = {
  token: string | null;
  setsearch: React.Dispatch<React.SetStateAction<response>>;
  setsearchmode: React.Dispatch<React.SetStateAction<number>>; // 新增
  searchmode: number; // 新增
};

type SearchProps = {
  setsearch: React.Dispatch<React.SetStateAction<response>>;
  token: string | null;
};

const Headers: React.FC<HeadersProps> = ({
  setsearch,
  searchmode,
  setsearchmode,
}) => {
  const [check, setCheck] = useState(1);
  const [input, setInput] = useState<string>("");
  const navigate = useNavigate();
  const list: Headers[] = [
    { id: 1, content: "法律法规", pick: check === 1 },
    { id: 3, content: "法律AI", pick: check == 3 },
    { id: 4, content: "法律咨询", pick: check == 4 },
  ];
  const Path: Path[] = [
    { id: 2, content: "关键词搜索", path: "keyword", check: 2 === searchmode },
    { id: 3, content: "高级搜索", path: "advanced", check: 3 === searchmode },
  ];

  const modeList = useRef<HTMLDivElement | null>(null);

  const disPlay = (): void => {
    if (modeList.current?.classList.contains("active")) {
      modeList.current?.classList.remove("active");
    } else {
      modeList.current?.classList.add("active");
    }
  };
  useEffect(() => {
    function remove() {
      modeList.current?.classList.remove("active");
    }
    setTimeout(() => {
      remove();
    }, 1000);
  }, [searchmode]);

  useEffect(() => {
    searchdata();
  }, []);

  async function searchdata() {
    const result = Path.find((el) => el.id === searchmode);
    const raw = JSON.stringify({
      keyword: input,
      fuzzy: false,
    });
    try {
      const res = await fetch(`/api/file/search/${result?.path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: raw,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      const filteredData = data.data.documents.map((item: any) => ({
        id: item.id,
        title: item.title,
        time: item.update_time ? item.update_time.slice(0, 10) : "",
        type: item.type,
      }));

      setsearch({
        total: data.data.total,
        array: filteredData,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const handleNavClick = (id: number) => {
    setCheck(id);
    if (id === 3) {
      navigate("/chat");
    } else if (id === 4) {
      navigate("/consult");
    } else {
      navigate("/index");
    }
  };

  return (
    <div className={Style.header}>
      <div className={Style.nav}>
        <div className={Style.logo}>
          <img src="/vite.svg" alt="logo" style={{ width: "100%" }} />
        </div>
        {list.map((element) => {
          return (
            <div
              className={`${Style.item} ${element.pick ? Style.picked : ""}`} // 动态添加类名
              key={element.id}
              onClick={() => handleNavClick(element.id)}
            >
              {element.content}
            </div>
          );
        })}
      </div>
      <div className={Style.secrch}>
        <div className={Style.modelist} ref={modeList}>
          {Path.map((el) => {
            return (
              <div
                className={Style.secrchWay}
                onClick={() => setsearchmode(el.id)}
                key={el.id}
                style={el.check ? { backgroundColor: "#84ade1b9" } : {}}
              >
                {el.content}
              </div>
            );
          })}
        </div>
        <BiChevronRight className={Style.mode} onClick={disPlay} />
        <input
          type="text"
          placeholder="secrch"
          onChange={(e) => setInput(e.target.value)}
        />
        <a href="#" className={Style.start} onClick={searchdata}>
          <FaSearch />
        </a>
      </div>
      <div className={Style.right}>
        <Link to="/user">
          <button
            className="bg-blue-400 rounded-full hover:bg-blue-500 text-white shadow-lg 
                transition-colors duration-300 ease-in-out px-4 py-2"
          >
            个人资料
          </button>
        </Link>
      </div>
    </div>
  );
};

const Search: React.FC<SearchProps> = ({ setsearch }) => {
  const [searchParams, setSearchParams] = useState({
    keyword: [""],
    fileType: "",
    startDate: "",
    endDate: "",
  });

  const handleSearch = async () => {
    // 日期验证逻辑
    if (
      searchParams.startDate &&
      searchParams.endDate &&
      new Date(searchParams.startDate) > new Date(searchParams.endDate)
    ) {
      alert("开始日期不能大于结束日期");
      return;
    }

    // 准备搜索参数
    const params = {
      keywords: searchParams.keyword,
      category: searchParams.fileType,
      start_date: searchParams.startDate+"T19:58:39.699+08:00",
      end_date: searchParams.endDate+"T19:58:39.699+08:00",
      filename: ""
    };

    // 调用父组件搜索逻辑
    console.log("Search parameters:", params);
    const raw = JSON.stringify(params);
    try {
      const res = await fetch(`/api/file/search/advanced`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: raw,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      const filteredData = data.data.documents.map((item: any) => ({
        id: item.id,
        title: item.title,
        time: item.update_time ? item.update_time.slice(0, 10) : "",
        type: item.type,
      }));

      setsearch({
        total: data.data.total,
        array: filteredData,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className={Style.search}>
      <div className={Style.searchContent}>
        <div className={Style.searchItem}>
          <div className={Style.searchLabel}>
            <span>文件类型:</span>
          </div>
          <div className={Style.searchInput}>
            <select
              value={searchParams.fileType}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  fileType: e.target.value,
                }))
              }
            >
              <option value="">全部</option>
              <option value="txt">txt</option>
              <option value="pdf">PDF</option>
              <option value="docx">docx</option>
            </select>
          </div>
        </div>

        {/* 时间范围选择 */}
        <div className={Style.searchItem}>
          <div className={Style.searchLabel}>
            <span>时间范围:</span>
          </div>
          <div className={Style.searchInput}>
            <input
              type="date"
              value={searchParams.startDate}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
            至
            <input
              type="date"
              value={searchParams.endDate}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <div className={Style.searchItem}>
          <div className={Style.searchLabel}>
            <span>关键词:</span>
          </div>
          <div className={Style.searchInput}>
            <input
              type="text"
              placeholder="请输入关键词"
              value={searchParams.keyword}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  keyword: [e.target.value],
                }))
              }
            />
          </div>
        </div>
        {/* 操作按钮 */}
        <div className={Style.buttonGroup}>
          <button className={Style.searchButton} onClick={handleSearch}>
            开始搜索
          </button>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [search, setsearch] = useState<response>({ total: 0, array: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchmode, setsearchmode] = useState(2);
  useEffect(() => {
    console.log(search);
  }, [search]);

  function download(id: number) {
    fetch(`/api/file/download/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      redirect: "follow",
    })
      .then((response) => {
        // 从响应头获取文件名和类型
        if (response.status === 403) {
          alert("权限不足，无法下载该文件");
          throw new Error("权限不足，无法下载该文件");
        }
        const contentDisposition = response.headers.get("content-disposition");
        // 解析文件名（优先使用服务器返回的文件名）
        let filename = `file_${id}`;
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="?(.+?)"?$/);
          if (match) filename = match[1];
        }

        return response.blob().then((blob) => ({ blob, filename: filename }));
      })
      .then(({ blob, filename }) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => console.log("Download error:", error));
  }

  return (
    <div className={Style.container}>
      <Headers
        setsearch={setsearch}
        token={localStorage.getItem("token")}
        setsearchmode={setsearchmode}
        searchmode={searchmode}
      />
      {searchmode === 3 && (
        <Search setsearch={setsearch} token={localStorage.getItem("token")} />
      )}
      <div className={Style.banner}>
        <div className={Style.sidebar}>
          <AdBanner token={localStorage.getItem("token")} />
          <TemplateLibrary/>
        </div>
        <div className={Style.content}>
          <div className={Style.list}>
            <div className={Style.total}>Total: {search.total}</div>
            <div className={Style.datalist}>
              {search.array.length > 0 ? (
                search.array
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((el) => (
                    <div className={Style.card} key={el.id}>
                      <div className={Style.topSection}>
                        <div className={Style.border}></div>
                        <span className={Style.title}>{el.title}</span>
                      </div>
                      <div className={Style.bottomSection}>
                        <div className={Style.row}>
                          <div className={Style.item}>
                            <span className={Style.bigText}>{el.time}</span>
                          </div>
                          <div className={Style.item}>
                            <span className={Style.bigText}>{el.type}</span>
                          </div>
                          <div className={Style.item}>
                            <LuDownload
                              className={Style.downloadIcon}
                              onClick={() => download(el.id)}
                            ></LuDownload>
                            <span className={Style.regularText}>download</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div>No data found.</div>
              )}
            </div>
          </div>
          <div className={Style.pagination}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </button>

            <span>
              第 {currentPage} 页 / 共 {Math.ceil(search.total / itemsPerPage)}{" "}
              页
            </span>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * itemsPerPage >= search.total}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
      <CustomComponent />
    </div>
  );
};

export default Index;

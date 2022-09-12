import "./../styles/Dropdown.scss";

type Props = {
  showMenu: Boolean;
  setShowMenu: Function;
  defaultValue: number | string;
  menuList: number[] | string[];
  action: Function;
};

export default (props: Props) => {
  const { showMenu, setShowMenu, defaultValue, menuList, action } = props;
  return (
    <div className="dropdown_container">
      <div
        className={`dropdown_bg ${showMenu ? "show_bg" : "hide_bg"}`}
        onClick={() => setShowMenu(!showMenu)}
      ></div>
      <div className="dropdown_body">
        <div className="default_area" onClick={() => setShowMenu(!showMenu)}>
          {defaultValue}
        </div>
        <div className={`unfold_area ${showMenu ? "unfold" : ""}`}>
          {menuList.map((item, index) => {
            return (
              <div
                className="each_row"
                key={index}
                onClick={() => action(item)}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

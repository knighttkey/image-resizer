import "./../styles/DropExpand.scss";

type Props = {
  showMenu: Boolean;
  setShowMenu: Function;
  defaultValue: number | string;
  menuList: number[] | string[];
  action: Function;
  defaultAreaSty?: {width:number, fontSize:number}
  eachItemSty?: {width:number, fontSize:number}
  disable?:Boolean;
};

export default (props: Props) => {
  const { showMenu, setShowMenu, defaultValue, menuList, action, defaultAreaSty, eachItemSty,disable } = props;
  return (
    <div className="drop_expand_container">
      <div
        className={`dropdown_bg ${showMenu ? "show_bg" : "hide_bg"}`}
        onClick={() => setShowMenu(!showMenu)}
      ></div>
      <div className="dropdown_body">
        <div className={`default_area ${disable? 'disable':''}`} style={defaultAreaSty? {width:defaultAreaSty.width+'px', fontSize:defaultAreaSty.fontSize+'px'}:{}} onClick={() => disable? null:setShowMenu(!showMenu)}>
          {defaultValue}
        </div>
        <div className={`unfold_area ${showMenu ? "unfold" : ""}`} style={defaultAreaSty? {left:defaultAreaSty.width+10+'px'}:{}}>
          {menuList.map((item, index) => {
            return (
              <div
                className={`each_item ${item === defaultValue ? 'current_item':''} ${disable? 'disable':''}`}
                style={eachItemSty? {width:eachItemSty.width+'px', fontSize:eachItemSty.fontSize+'px'}:{}}
                key={index}
                onClick={() => disable ? null : action(item)}
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

import logo from "../../assets/images/logo.svg";

const PageLoader = () => {
    return (
        <div className="preloader-overlay">
            {/* <img src={logo} alt="Site Logo" className="loader-logo" /> */}
            <div className="spinner"></div>
        </div>
    );
};

export default PageLoader;

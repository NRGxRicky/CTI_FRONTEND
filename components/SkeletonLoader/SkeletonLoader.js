import React from 'react';

const SkeletonLoader = () => (
  <div className="skeleton-list">
    {[...Array(6)].map((_, i) => (
      <div className="search-box__item" key={i}>
        <div className="search-box__item__box">
          <div className="search-box_item__container">
            <div className="search-box__item__image">
              <div className="search-box__image skeleton-anim" />
            </div>
            <div className="search-box__item__title">
              <div className="skeleton-title skeleton-anim" />
              <div className="search_box__item__model text--off">
                <div className="skeleton-model skeleton-anim" />
              </div>
            </div>
          </div>
          <div className="search-box__info">
            <div className="search-box__price">
              <div className="skeleton-price skeleton-anim" />
            </div>
            <div className="search-box__stock text--off">
              <div className="skeleton-stock skeleton-anim" />
            </div>
          </div>
        </div>
      </div>
    ))}
    <style jsx>{`
      .skeleton-list {
        width: 100%;
      }
      .search-box__item {
        padding: 10px;
        border-bottom: 1px solid #eaeaea;
      }
      .search-box__item:last-child {
        border: 0;
      }
      .search-box__item__box {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 10px;
        max-width: 100%;
      }
      .search-box_item__container {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
      }
      .search-box__item__image {
        position: relative;
        min-width: 70px;
        height: 50px;
        mix-blend-mode: multiply;
        margin-right: 10px;
      }
      .search-box__image {
        position: relative;
        height: 50px;
        width: 50px;
        border-radius: 6px;
        background: #ececec;
      }
      .search-box__item__title {
        font-weight: 600;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }
      .skeleton-title {
        height: 14px;
        width: 80%;
        border-radius: 4px;
        background: #ececec;
        margin-bottom: 6px;
      }
      .skeleton-model {
        height: 10px;
        width: 50%;
        border-radius: 4px;
        background: #ececec;
      }
      .search-box__info {
        text-align: right;
        width: 15%;
        min-width: 100px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
      }
      .skeleton-price {
        height: 14px;
        width: 60px;
        border-radius: 4px;
        background: #ececec;
        margin-bottom: 4px;
      }
      .skeleton-stock {
        height: 10px;
        width: 40px;
        border-radius: 4px;
        background: #ececec;
      }
      .skeleton-anim {
        background: linear-gradient(90deg, #ececec 25%, #f3f3f3 50%, #ececec 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.2s infinite linear;
      }
      @keyframes skeleton-loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

    `}</style>
  </div>
);

export default SkeletonLoader; 
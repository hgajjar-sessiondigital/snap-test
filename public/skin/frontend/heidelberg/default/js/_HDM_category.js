/**
 * Functions related to the layered navigation.
 *
 * @author David Bodrogi <dbodrogi@sessiondigital.de>
 * */

var _HDM_Category = (function($) {
    'use strict';

    var _isInited = false,
        _closedFilterClass = 'closed',
        _lastItemClass = 'last',
        _hiddenFilterClass = 'hidden',
        _shadowClass = 'shadow',
        _openedClass = 'opened',
        _topCategoriesSingleClass = 'single',
        _maximumItemsToShow = 3;

    return {
        /* Initialization scripts */
        init: function() {
            if (!_isInited) {
                _HDM_Category.initFilters();
                _HDM_Category.initTopCategoryTabs();
                _HDM_Category.setCategoryImageAlignment();

                _isInited = true;
            }
        },
        initFilters: function() {
            $(document).ready(function() {
                var $layeredNav = $('.block-layered-nav'),
                    $categoryFilters = $('.filters-container.category'),
                    $otherFilters = $('.filters-container.others'),
                    $filterItemsBlocks = $otherFilters.find('.filter-items-block');

                // add "last" class on the last element in the category filter
                $categoryFilters.find('.category-filters:last > li:last > .parent-category').addClass(_lastItemClass);

                // handle category filter accordion
                $categoryFilters.find('.filter-arrow').click(function() {
                    var $parentLi = $(this).closest('li');

                    if ($(this).hasClass(_openedClass)) {
                        $(this).removeClass(_openedClass);
                        $parentLi.removeClass(_openedClass);
                    } else {
                        $(this).addClass(_openedClass);
                        $parentLi.addClass(_openedClass);
                    }
                });

                // handle filter accordion
                $otherFilters.find('dt.filter-name').click(function() {
                    if ($(this).hasClass(_closedFilterClass)) {
                        $(this).removeClass(_closedFilterClass);
                        $(this).next('dd').slideDown('fast');
                    } else {
                        $(this).addClass(_closedFilterClass);
                        $(this).next('dd').slideUp('fast');
                    }
                });

                // handle checkbox state
                $otherFilters.find('.filter-item .checkbox').change(function() {
                    if (!$(this).data('clicked')) {
                        $(this).data('clicked', true);

                        window.location.href = $(this).closest('a').attr('href');
                    }
                });


                $filterItemsBlocks.each(function(index, itemsBlock) {
                    var $itemsBlock = $(itemsBlock),
                        $items = $itemsBlock.find('.filter-item'),
                        $showMoreLink = $itemsBlock.find('.show-more'),
                        showMoreLinkVisible = false;

                    if ($items.length > _maximumItemsToShow && !$itemsBlock.find('.filter-item.active').length) {
                        // there is no active filter(s), show only the first 3 items and hide the others
                        $items.slice(_maximumItemsToShow).addClass(_hiddenFilterClass);
                        showMoreLinkVisible = true;
                    } else if ($items.length > _maximumItemsToShow && $itemsBlock.find('.filter-item.active').length) {
                        // there are more than 3 items and having active item(s)
                        var lastActiveItemIndex = $items.index($items.filter('.active').last()),
                            $itemsToHide = $items.slice(lastActiveItemIndex + _maximumItemsToShow + 1);
                        $itemsToHide.addClass(_hiddenFilterClass);
                        if ($itemsToHide.length) {
                            showMoreLinkVisible = true;
                        }
                    }

                    if (showMoreLinkVisible) {
                        $showMoreLink.removeClass(_hiddenFilterClass);
                    } else {
                        $showMoreLink.remove();
                    }
                });

                // handle show more item
                $layeredNav.find('.show-more a').click(function() {
                    $(this).closest('ol').find('li.' + _hiddenFilterClass).removeClass(_hiddenFilterClass);
                    $(this).closest('li').remove();

                    return false;
                });
            });
        },
        initTopCategoryTabs: function() {
            $(document).ready(function() {
                var $topCategoriesWrapper = $('.top-categories'),
                    $topCategoryTabs = $topCategoriesWrapper.find('ul.tabs'),
                    $topCategoryTabItems = $topCategoryTabs.find('li');

                if (!$topCategoryTabs.length) {
                    return;
                }
                
                if ($topCategoriesWrapper.height() == $topCategoryTabItems.height()) {
                    $topCategoriesWrapper.addClass(_topCategoriesSingleClass);
                }

                if ($topCategoryTabItems.length == 1) {
                    $topCategoryTabItems.addClass(_shadowClass);
                } else {
                    $topCategoryTabs.first().addClass(_shadowClass);
                    $topCategoryTabItems.last().addClass(_lastItemClass);
                }
            });
        },
        setCategoryImageAlignment: function() {
            $(window).load(function() {
                var $categoryImage = $('.category-image'),
                    $categoryTopSection = $('.category-top-section.has-image'),
                    $categoryTitle = $('.category-title'),
                    $categoryDescription = $('.category-description');

                var titleMarginTop = $categoryTitle.height();
                if (titleMarginTop < 0) {
                    titleMarginTop = 0;
                }

                // ensure category title does not overlap with category description
                // note: did not create a separated function for this because it is linked to image alignment below
                $categoryDescription.css({
                    'margin-top': titleMarginTop
                });

                if (!$categoryImage.length) {
                    return;
                }

                $(window).resize(function() {
                    var marginTop = $categoryTopSection.height() - $categoryImage.height();
                    if (marginTop < 0) {
                        marginTop = 0;
                    }

                    $categoryImage.css({
                        'margin-top': marginTop,
                        'visibility': 'visible'
                    });
                }).resize();
            });
        }
    }
})(jQuery);

// Calling the initialization sequence
_HDM_Category.init();

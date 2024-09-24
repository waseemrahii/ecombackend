import Category from '../models/categoryModel.js';
import SubCategory from '../models/subCategoryModel.js';
import SubSubCategory from '../models/subSubCategoryModel.js';
import Brand from '../models/brandModel.js';
import Color from '../models/colorModel.js';
import Attribute from '../models/attributeModel.js';

export const validateSlug = async (Model, slug) => {
    const obj = slug ? await Model.findOne({ slug }) : null;
    if (slug && !obj) {
        throw new Error(`Invalid ${Model.modelName.toLowerCase()} slug`);
    }
    return obj;
};

export const validateProductDependencies = async ({ category, subCategorySlug, subSubCategorySlug, brand, colors, attributes }) => {
    const categoryObj = await validateSlug(Category, category);
    const subCategoryObj = await validateSlug(SubCategory, subCategorySlug);
    const subSubCategoryObj = await validateSlug(SubSubCategory, subSubCategorySlug);

    const brandObj = await Brand.findById(brand);
    if (!brandObj) {
        throw new Error('Invalid brand ID');
    }

    const colorObjs = await Color.find({ _id: { $in: colors } });
    if (colors && colorObjs.length !== colors.length) {
        throw new Error('One or more color IDs are invalid');
    }

    const attributeObjs = attributes ? await Attribute.find({ _id: { $in: attributes } }) : [];
    if (attributes && attributeObjs.length !== attributes.length) {
        throw new Error('One or more attribute IDs are invalid');
    }

    return {
        categoryObj,
        subCategoryObj,
        subSubCategoryObj,
        brandObj,
        colorObjs,
        attributeObjs
    };
};







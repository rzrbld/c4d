/**
 * $Id: mxC4.js,v 1.5 2018/26/11 12:32:06 mate Exp $
 * Copyright (c) 2006-2018, JGraph Ltd
 */
//**********************************************************************************************************************************************************
// Person
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeC4Person(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeC4Person, mxShape);

mxShapeC4Person.prototype.cst = {PERSONSHAPE : 'mxgraph.c4.person'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeC4Person.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var headSize = Math.min(w / 2, h / 3);
	var r = headSize / 2;
	
	c.ellipse(w * 0.5 - headSize * 0.5, 0, headSize, headSize);
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, headSize * 0.8 + r);
	c.arcTo(r, r, 0, 0, 1, r, headSize * 0.8);
	c.lineTo(w - r, headSize * 0.8);
	c.arcTo(r, r, 0, 0, 1, w, headSize * 0.8 + r);
	c.lineTo(w, h - r);
	c.arcTo(r, r, 0, 0, 1, w - r, h);
	c.lineTo(r, h);
	c.arcTo(r, r, 0, 0, 1, 0, h -r);
	c.close();
	c.fillAndStroke();

	c.setShadow(false);
	
	c.ellipse(w * 0.5 - headSize * 0.5, 0, headSize, headSize);
	c.fillAndStroke();

};

mxShapeC4Person.prototype.getLabelMargins = function(rect)
{
	var headSize = Math.min(rect.width / 2, rect.height / 3);
		
	return new mxRectangle(0, headSize * 0.8, 0, 0);
};

mxCellRenderer.registerShape(mxShapeC4Person.prototype.cst.PERSONSHAPE, mxShapeC4Person);

//**********************************************************************************************************************************************************
// Person
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeC4Person2(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeC4Person2, mxShape);

mxShapeC4Person2.prototype.cst = {PERSONSHAPE : 'mxgraph.c4.person2'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeC4Person2.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var headSize = Math.min(w * 0.45, h * 0.45);
	var r = headSize / 2;
	
	c.ellipse(w * 0.5 - headSize * 0.5, 0, headSize, headSize);
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, headSize * 0.8 + r);
	c.arcTo(r, r, 0, 0, 1, r, headSize * 0.8);
	c.lineTo(w - r, headSize * 0.8);
	c.arcTo(r, r, 0, 0, 1, w, headSize * 0.8 + r);
	c.lineTo(w, h - r);
	c.arcTo(r, r, 0, 0, 1, w - r, h);
	c.lineTo(r, h);
	c.arcTo(r, r, 0, 0, 1, 0, h -r);
	c.close();
	c.fillAndStroke();

	c.setShadow(false);
	
	c.ellipse(w * 0.5 - headSize * 0.5, 0, headSize, headSize);
	c.fillAndStroke();

};

mxShapeC4Person2.prototype.getLabelMargins = function(rect)
{
	var headSize = Math.min(rect.width * 0.45, rect.height * 0.45);
		
	return new mxRectangle(0, headSize * 0.8, 0, 0);
};

mxCellRenderer.registerShape(mxShapeC4Person2.prototype.cst.PERSONSHAPE	, mxShapeC4Person2);

//**********************************************************************************************************************************************************
// Web Browser Container
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeC4WebBrowserContainer(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeC4WebBrowserContainer, mxShape);

mxShapeC4WebBrowserContainer.prototype.cst = {WEB_BROWSER_CONTAINER_SHAPE : 'mxgraph.c4.webBrowserContainer'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeC4WebBrowserContainer.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var r = 8;
	
	c.begin();
	c.moveTo(0, r);
	c.arcTo(r, r, 0, 0, 1, r, 0);
	c.lineTo(w - r, 0);
	c.arcTo(r, r, 0, 0, 1, w, r);
	c.lineTo(w, h - r);
	c.arcTo(r, r, 0, 0, 1, w - r, h);
	c.lineTo(r, h);
	c.arcTo(r, r, 0, 0, 1, 0, h - r);
	c.close();
	c.fillAndStroke();

	c.setShadow(false);
	
	var ins = 5;
	var r2 = 3;
	var h2 = 12;
	
	if (w > (ins * 5 + h2 * 3) && h > (2 * h2 + 3 * ins))
	{
		c.setFillColor('#23A2D9');
		
		c.begin();
		c.moveTo(ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, ins + r2, ins);
		c.lineTo(w - 3 * h2 - 4 * ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 4 * ins, ins + r2);
		c.lineTo(w - 3 * h2 - 4 * ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 4 * ins - r2, ins + h2);
		c.lineTo(ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, ins, ins + h2 - r2);
		c.close();
	
		c.moveTo(w - 3 * h2 - 3 * ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 3 * ins + r2, ins);
		c.lineTo(w - 2 * h2 - 3 * ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 3 * ins, ins + r2);
		c.lineTo(w - 2 * h2 - 3 * ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 3 * ins - r2, ins + h2);
		c.lineTo(w - 3 * h2 - 3 * ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 3 * ins, ins + h2 - r2);
		c.close();
	
		c.moveTo(w - 2 * h2 - 2 * ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 2 * ins + r2, ins);
		c.lineTo(w - h2 - 2 * ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - 2 * ins, ins + r2);
		c.lineTo(w - h2 - 2 * ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - 2 * ins - r2, ins + h2);
		c.lineTo(w - 2 * h2 - 2 * ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 2 * ins, ins + h2 - r2);
		c.close();
	
		c.moveTo(w - h2 - ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - ins + r2, ins);
		c.lineTo(w - ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - ins, ins + r2);
		c.lineTo(w - ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - ins - r2, ins + h2);
		c.lineTo(w - h2 - ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - ins, ins + h2 - r2);
		c.close();

		c.moveTo(ins, h2 + 2 * ins + r);
		c.arcTo(r, r, 0, 0, 1, ins + r, h2 + 2 * ins);
		c.lineTo(w - r - ins, h2 + 2 * ins);
		c.arcTo(r, r, 0, 0, 1, w - ins, h2 + 2 * ins + r);
		c.lineTo(w - ins, h - r - ins);
		c.arcTo(r, r, 0, 0, 1, w - r - ins, h - ins);
		c.lineTo(ins + r, h - ins);
		c.arcTo(r, r, 0, 0, 1, ins, h - r - ins);
		c.close();
		c.fill();
		
		c.fill();
	}
};

mxCellRenderer.registerShape(mxShapeC4WebBrowserContainer.prototype.cst.WEB_BROWSER_CONTAINER_SHAPE, mxShapeC4WebBrowserContainer);


// cylinder 3 from drawio
// Flexible cylinder3 Shape with offset label
function CylinderShape3(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(CylinderShape3, mxCylinder);

CylinderShape3.prototype.size = 15;

CylinderShape3.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var size = Math.max(0, Math.min(h * 0.5, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
	var lid = mxUtils.getValue(this.style, 'lid', true);

	c.translate(x,y);

	if (size == 0)
	{
		c.rect(0, 0, w, h);
		c.fillAndStroke();
	}
	else
	{
		c.begin();
		
		if (lid)
		{
			c.moveTo(0, size);
			c.arcTo(w * 0.5, size, 0, 0, 1, w * 0.5, 0);
			c.arcTo(w * 0.5, size, 0, 0, 1, w, size);
		}
		else
		{
			c.moveTo(0, 0);
			c.arcTo(w * 0.5, size, 0, 0, 0, w * 0.5, size);
			c.arcTo(w * 0.5, size, 0, 0, 0, w, 0);
		}

		c.lineTo(w, h - size);
		c.arcTo(w * 0.5, size, 0, 0, 1, w * 0.5, h);
		c.arcTo(w * 0.5, size, 0, 0, 1, 0, h - size);
		c.close();
		c.fillAndStroke();
		
		c.setShadow(false);
		
		if (lid)
		{
			c.begin();
			c.moveTo(w, size);
			c.arcTo(w * 0.5, size, 0, 0, 1, w * 0.5, 2 * size);
			c.arcTo(w * 0.5, size, 0, 0, 1, 0, size);
			c.stroke();
		}
	}
};

mxCellRenderer.registerShape('cylinder3', CylinderShape3);

// Hexagon shape
function HexagonShape()
{
	mxActor.call(this);
};

mxUtils.extend(HexagonShape, mxHexagon);

HexagonShape.prototype.size = 0.25;

HexagonShape.prototype.fixedSize = 20;

HexagonShape.prototype.isRoundable = function()
{
	return true;
};
HexagonShape.prototype.redrawPath = function(c, x, y, w, h)
{
	var fixed = mxUtils.getValue(this.style, 'fixedSize', '0') != '0';
	var s = (fixed) ? Math.max(0, Math.min(w * 0.5, parseFloat(mxUtils.getValue(this.style, 'size', this.fixedSize)))) :
		w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
	var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
	this.addPoints(c, [new mxPoint(s, 0), new mxPoint(w - s, 0), new mxPoint(w, 0.5 * h), new mxPoint(w - s, h),
					   new mxPoint(s, h), new mxPoint(0, 0.5 * h)], this.isRounded, arcSize, true);
};

mxCellRenderer.registerShape('hexagon', HexagonShape);

// PartialRectangleShape
function PartialRectangleShape()
{
	mxEllipse.call(this);
};

mxUtils.extend(PartialRectangleShape, mxEllipse);

PartialRectangleShape.prototype.drawHidden = true;

PartialRectangleShape.prototype.paintVertexShape = function(c, x, y, w, h)
{
	if (!this.outline)
	{
		c.setStrokeColor(null);
	}

	if (this.style != null)
	{
		var pointerEvents = c.pointerEvents;
		var filled = this.fill != null && this.fill != mxConstants.NONE;
		var events = mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1';
		
		if (!events && !filled)
		{
			c.pointerEvents = false;
		}

		var top = mxUtils.getValue(this.style, 'top', '1') == '1';
		var left = mxUtils.getValue(this.style, 'left', '1') == '1';
		var right = mxUtils.getValue(this.style, 'right', '1') == '1';
		var bottom = mxUtils.getValue(this.style, 'bottom', '1') == '1';

		if (this.drawHidden || filled || this.outline || top || right || bottom || left)
		{
			c.rect(x, y, w, h);
			c.fill();

			c.pointerEvents = pointerEvents;
			c.setStrokeColor(this.stroke);
			c.setLineCap('square');
			c.begin();
			c.moveTo(x, y);
			
			if (this.outline || top)
			{
				c.lineTo(x + w, y);
			}
			else
			{
				c.moveTo(x + w, y);
			}
			
			if (this.outline || right)
			{
				c.lineTo(x + w, y + h);
			}
			else
			{
				c.moveTo(x + w, y + h);
			}
			
			if (this.outline || bottom)
			{
				c.lineTo(x, y + h);
			}
			else
			{
				c.moveTo(x, y + h);
			}
			
			if (this.outline || left)
			{
				c.lineTo(x, y);
			}
			
			c.end();
			c.stroke();
			c.setLineCap('flat');
		}
		else
		{
			c.setStrokeColor(this.stroke);
		}
	}
};

mxCellRenderer.registerShape('partialRectangle', PartialRectangleShape);


//**********************************************************************************************************************************************************
// Web Browser Container v2
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeC4WebBrowserContainer2(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeC4WebBrowserContainer2, mxShape);

mxShapeC4WebBrowserContainer2.prototype.cst = {WEB_BROWSER_CONTAINER2_SHAPE : 'mxgraph.c4.webBrowserContainer2'};

mxShapeC4WebBrowserContainer2.prototype.customProperties = [
	{name: 'strokeColor2', dispName: 'Outline color', type: 'color', defVal: '#0E7DAD'}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeC4WebBrowserContainer2.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var r = 8;
	var fillColor = mxUtils.getValue(this.state.style, 'fillColor', '#ffffff');
	var strokeColor = mxUtils.getValue(this.state.style, 'strokeColor', '#000000');
	var strokeColor2 = mxUtils.getValue(this.state.style, 'strokeColor2', '#0E7DAD');

	c.setStrokeColor(strokeColor2);
	c.setFillColor(strokeColor);
	
	c.begin();
	c.moveTo(0, r);
	c.arcTo(r, r, 0, 0, 1, r, 0);
	c.lineTo(w - r, 0);
	c.arcTo(r, r, 0, 0, 1, w, r);
	c.lineTo(w, h - r);
	c.arcTo(r, r, 0, 0, 1, w - r, h);
	c.lineTo(r, h);
	c.arcTo(r, r, 0, 0, 1, 0, h - r);
	c.close();
	c.fillAndStroke();

	c.setShadow(false);
	
	var ins = 5;
	var r2 = 3;
	var h2 = 12;
	
	if (w > (ins * 5 + h2 * 3) && h > (2 * h2 + 3 * ins))
	{
		//set fill color to fill color
		c.setFillColor(fillColor);
		
		c.begin();
		c.moveTo(ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, ins + r2, ins);
		c.lineTo(w - 3 * h2 - 4 * ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 4 * ins, ins + r2);
		c.lineTo(w - 3 * h2 - 4 * ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 4 * ins - r2, ins + h2);
		c.lineTo(ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, ins, ins + h2 - r2);
		c.close();
	
		c.moveTo(w - 3 * h2 - 3 * ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 3 * ins + r2, ins);
		c.lineTo(w - 2 * h2 - 3 * ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 3 * ins, ins + r2);
		c.lineTo(w - 2 * h2 - 3 * ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 3 * ins - r2, ins + h2);
		c.lineTo(w - 3 * h2 - 3 * ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, w - 3 * h2 - 3 * ins, ins + h2 - r2);
		c.close();
	
		c.moveTo(w - 2 * h2 - 2 * ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 2 * ins + r2, ins);
		c.lineTo(w - h2 - 2 * ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - 2 * ins, ins + r2);
		c.lineTo(w - h2 - 2 * ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - 2 * ins - r2, ins + h2);
		c.lineTo(w - 2 * h2 - 2 * ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, w - 2 * h2 - 2 * ins, ins + h2 - r2);
		c.close();
	
		c.moveTo(w - h2 - ins, ins + r2);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - ins + r2, ins);
		c.lineTo(w - ins - r2, ins);
		c.arcTo(r2, r2, 0, 0, 1, w - ins, ins + r2);
		c.lineTo(w - ins, ins + h2 - r2);
		c.arcTo(r2, r2, 0, 0, 1, w - ins - r2, ins + h2);
		c.lineTo(w - h2 - ins + r2, ins + h2);
		c.arcTo(r2, r2, 0, 0, 1, w - h2 - ins, ins + h2 - r2);
		c.close();

		c.moveTo(ins, h2 + 2 * ins + r);
		c.arcTo(r, r, 0, 0, 1, ins + r, h2 + 2 * ins);
		c.lineTo(w - r - ins, h2 + 2 * ins);
		c.arcTo(r, r, 0, 0, 1, w - ins, h2 + 2 * ins + r);
		c.lineTo(w - ins, h - r - ins);
		c.arcTo(r, r, 0, 0, 1, w - r - ins, h - ins);
		c.lineTo(ins + r, h - ins);
		c.arcTo(r, r, 0, 0, 1, ins, h - r - ins);
		c.close();
		c.fill();
		
		c.fill();
	}
};

mxCellRenderer.registerShape(mxShapeC4WebBrowserContainer2.prototype.cst.WEB_BROWSER_CONTAINER2_SHAPE, mxShapeC4WebBrowserContainer2);

